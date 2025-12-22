'use client';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAllocationSchema, EquipmentItem } from '../../types/allocation';
import { useAllocationFormStore } from '../../stores/allocationFormStore';
import { useCreateAllocation } from '../../hooks/useAllocations';
import { useAvailableEquipment } from '../../hooks/useEquipment';
import Modal from '../ui/Modal';
import { EquipmentTypeSchema } from '../../types/equipment';
import { z } from 'zod';
import JiraAssetSelector from '../equipment/JiraAssetSelector';
import { JiraAssetObject } from '../../types/jira-asset';
import { jiraAssetToEquipmentFormData, getAttributeValue } from '../../utils/jiraAssetHelpers';

const equipmentTypeLabels: Record<string, string> = {
  PC_PORTABLE: 'PC Portable',
  PC_FIXE: 'PC Fixe',
  TABLETTE: 'Tablette',
  MOBILE: 'Mobile',
  ECRAN: 'Écran',
  TELEPHONE_IP: 'Téléphone IP',
  AUTRES: 'Autres',
};

const standardAccessories = [
  'Étui',
  'Sacoche',
  'Souris',
  'Clavier',
  'Chargeur',
  'Câble USB',
  'Housse de protection',
];

const standardServices = [
  'SharePoint',
  'Teams',
  '3CX',
  'LifeSize',
  'Zeendoc',
  'OneDrive',
];

const AllocationFormModal: React.FC = () => {
  const {
    isOpen,
    selectedEmployee,
    closeModal,
    equipments,
    addEquipment,
    removeEquipment,
    updateEquipment,
  } = useAllocationFormStore();

  const createAllocation = useCreateAllocation();
  const { data: availableEquipment, isLoading: isLoadingEquipment } = useAvailableEquipment();
  const [selectedJiraAssets, setSelectedJiraAssets] = useState<Record<number, JiraAssetObject>>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(CreateAllocationSchema),
    defaultValues: {
      userId: selectedEmployee?._id || '',
      equipments: equipments.length > 0 ? equipments : [{
        equipmentId: '',
        internalId: '',
        type: '',
        serialNumber: '',
        deliveredDate: new Date().toISOString().split('T')[0],
        condition: 'bon_etat',
      }],
      deliveryDate: new Date().toISOString().split('T')[0],
      accessories: [],
      additionalSoftware: [],
      services: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'equipments',
  });

  useEffect(() => {
    if (selectedEmployee) {
      reset({
        userId: selectedEmployee._id,
        equipments: equipments.length > 0 ? equipments : [{
          equipmentId: '',
          internalId: '',
          type: '',
          serialNumber: '',
          deliveredDate: new Date().toISOString().split('T')[0],
          condition: 'bon_etat',
        }],
        deliveryDate: new Date().toISOString().split('T')[0],
        accessories: [],
        additionalSoftware: [],
        services: [],
        notes: '',
      });
      // Réinitialiser les sélections Jira quand le modal s'ouvre
      setSelectedJiraAssets({});
    }
  }, [selectedEmployee, equipments, reset]);

  const watchedAccessories = watch('accessories');
  const watchedServices = watch('services');
  const watchedAdditionalSoftware = watch('additionalSoftware');

  const onSubmit = async (data: z.infer<typeof CreateAllocationSchema>) => {
    if (!selectedEmployee) {
      alert('Aucun employé sélectionné');
      return;
    }

    try {
      // Valider et nettoyer les données avant l'envoi
      const cleanedData: CreateAllocation = {
        userId: data.userId,
        equipments: data.equipments.map((eq, index) => {
          // S'assurer que chaque équipement a au moins un serialNumber ou equipmentId
          if (!eq.serialNumber && !eq.equipmentId) {
            throw new Error(`L'équipement ${index + 1} doit avoir un numéro de série ou être sélectionné depuis le système`);
          }
          
          // Construire l'objet équipement avec tous les champs nécessaires
          const cleaned: any = {};
          
          // Champs requis ou fortement recommandés
          if (eq.equipmentId) {
            cleaned.equipmentId = eq.equipmentId;
          }
          if (eq.serialNumber) {
            cleaned.serialNumber = eq.serialNumber;
          }
          
          // Champs optionnels mais importants
          if (eq.type) cleaned.type = eq.type;
          if (eq.brand) cleaned.brand = eq.brand;
          if (eq.model) cleaned.model = eq.model;
          if (eq.internalId) cleaned.internalId = eq.internalId;
          if (eq.deliveredDate) cleaned.deliveredDate = eq.deliveredDate;
          if (eq.condition) cleaned.condition = eq.condition;
          
          // Ajouter les champs Jira si présents
          const jiraAsset = selectedJiraAssets[index];
          if (jiraAsset) {
            cleaned.jiraAssetId = jiraAsset.id;
          }
          
          // Validation finale : au moins equipmentId OU serialNumber doit être présent
          if (!cleaned.equipmentId && !cleaned.serialNumber) {
            throw new Error(`L'équipement ${index + 1} doit avoir un numéro de série ou un ID d'équipement`);
          }
          
          return cleaned;
        }),
        deliveryDate: data.deliveryDate || new Date().toISOString().split('T')[0],
        // Envoyer des tableaux vides au lieu de undefined pour éviter les erreurs de validation backend
        accessories: Array.isArray(data.accessories) ? data.accessories : [],
        additionalSoftware: Array.isArray(data.additionalSoftware) ? data.additionalSoftware : [],
        services: Array.isArray(data.services) ? data.services : [],
        notes: data.notes && data.notes.trim().length > 0 ? data.notes.trim() : undefined,
      };

      console.log('Données à envoyer:', cleanedData);
      
      await createAllocation.mutateAsync(cleanedData);
      closeModal();
      reset();
      setSelectedJiraAssets({});
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'allocation:', error);
      console.error('Détails de l\'erreur:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });
      
      // Gestion d'erreur plus détaillée
      let errorMessage = 'Erreur lors de la création de l\'allocation';
      
      // Priorité 1 : Message d'erreur du backend
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } 
      // Priorité 2 : Erreur de validation du backend
      else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      // Priorité 3 : Erreur de validation détaillée (array d'erreurs)
      else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((e: any) => e.message || e).join(', ');
      }
      // Priorité 4 : Message d'erreur générique
      else if (error?.message) {
        errorMessage = error.message;
      } 
      // Priorité 5 : String directe
      else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    }
  };

  // Mapper le type depuis Jira vers notre format
  const mapJiraTypeToEquipmentType = (jiraType?: string): string => {
    if (!jiraType) return '';
    const lowerType = jiraType.toLowerCase();
    if (lowerType.includes('laptop') || lowerType.includes('portable')) return 'PC_PORTABLE';
    if (lowerType.includes('desktop') || lowerType.includes('fixe')) return 'PC_FIXE';
    if (lowerType.includes('tablet')) return 'TABLETTE';
    if (lowerType.includes('mobile') || lowerType.includes('phone')) return 'MOBILE';
    if (lowerType.includes('screen') || lowerType.includes('écran') || lowerType.includes('monitor')) return 'ECRAN';
    if (lowerType.includes('ip phone') || lowerType.includes('téléphone ip')) return 'TELEPHONE_IP';
    return 'AUTRES';
  };

  // Gérer la sélection d'un équipement depuis MongoDB
  const handleEquipmentSelect = (index: number, equipmentId: string) => {
    const equipment = availableEquipment?.find((eq) => eq._id === equipmentId);
    if (equipment) {
      setValue(`equipments.${index}.equipmentId`, equipment._id);
      setValue(`equipments.${index}.serialNumber`, equipment.serialNumber);
      setValue(`equipments.${index}.internalId`, equipment.internalId || '');
      setValue(`equipments.${index}.type`, equipment.type);
      if (equipment.brand) setValue(`equipments.${index}.brand`, equipment.brand);
      if (equipment.model) setValue(`equipments.${index}.model`, equipment.model);
      // Réinitialiser la sélection Jira pour cet index
      const newSelectedJiraAssets = { ...selectedJiraAssets };
      delete newSelectedJiraAssets[index];
      setSelectedJiraAssets(newSelectedJiraAssets);
    }
  };

  // Gérer la sélection d'un équipement depuis Jira
  const handleJiraAssetSelect = (index: number, asset: JiraAssetObject, formData: any) => {
    // Vérifier si l'équipement existe déjà dans MongoDB par numéro de série
    const existingEquipment = availableEquipment?.find(
      (eq) => eq.serialNumber === formData.serialNumber
    );

    if (existingEquipment) {
      // L'équipement existe déjà, utiliser son ID MongoDB
      setValue(`equipments.${index}.equipmentId`, existingEquipment._id);
      setValue(`equipments.${index}.serialNumber`, existingEquipment.serialNumber);
      setValue(`equipments.${index}.internalId`, existingEquipment.internalId || formData.internalId || '');
      setValue(`equipments.${index}.type`, existingEquipment.type);
      if (existingEquipment.brand) setValue(`equipments.${index}.brand`, existingEquipment.brand);
      if (existingEquipment.model) setValue(`equipments.${index}.model`, existingEquipment.model);
    } else {
      // L'équipement n'existe pas encore, remplir avec les données Jira
      // equipmentId restera vide (sera créé lors de l'allocation si nécessaire)
      setValue(`equipments.${index}.equipmentId`, '');
      if (formData.serialNumber) {
        setValue(`equipments.${index}.serialNumber`, formData.serialNumber, { shouldValidate: true });
      }
      if (formData.internalId) {
        setValue(`equipments.${index}.internalId`, formData.internalId);
      }
      if (formData.type) {
        const mappedType = mapJiraTypeToEquipmentType(formData.type);
        if (mappedType) {
          setValue(`equipments.${index}.type`, mappedType);
        }
      }
      if (formData.brand) {
        setValue(`equipments.${index}.brand`, formData.brand);
      }
      if (formData.model) {
        setValue(`equipments.${index}.model`, formData.model);
      }
    }

    // Enregistrer l'asset Jira sélectionné
    setSelectedJiraAssets((prev) => ({ ...prev, [index]: asset }));
  };

  if (!selectedEmployee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`Affecter du matériel à ${selectedEmployee.displayName}`}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 pb-4">
        {/* Informations utilisateur (lecture seule) */}
        <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <h3 className="font-semibold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mb-2 sm:mb-3">
            Informations utilisateur
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Nom:</span>
              <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm sm:text-base break-words">
                {selectedEmployee.displayName}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Email:</span>
              <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm sm:text-base break-words">
                {selectedEmployee.email}
              </p>
            </div>
            {selectedEmployee.department && (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Département:</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm sm:text-base break-words">
                  {selectedEmployee.department}
                </p>
              </div>
            )}
            {selectedEmployee.officeLocation && (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Localisation:</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm sm:text-base break-words">
                  {selectedEmployee.officeLocation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Date de dotation */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Date de dotation *
          </label>
          <input
            type="date"
            {...register('deliveryDate')}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.deliveryDate && (
            <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
              {errors.deliveryDate.message as string}
            </p>
          )}
        </div>

        {/* Liste des équipements */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Équipements à affecter *
            </h3>
            <button
              type="button"
              onClick={() => {
                append({
                  equipmentId: '',
                  internalId: '',
                  type: '',
                  serialNumber: '',
                  deliveredDate: new Date().toISOString().split('T')[0],
                  condition: 'bon_etat',
                });
                // Réinitialiser les sélections Jira pour le nouvel index
                const newIndex = fields.length;
                setSelectedJiraAssets((prev) => {
                  const updated = { ...prev };
                  // Décaler les indices si nécessaire
                  return updated;
                });
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors whitespace-nowrap"
            >
              + Ajouter un équipement
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-4 transition-all ${
                  selectedJiraAssets[index]
                    ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-50">
                    Équipement {index + 1}
                  </h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        remove(index);
                        // Supprimer la sélection Jira associée
                        const newSelectedJiraAssets = { ...selectedJiraAssets };
                        delete newSelectedJiraAssets[index];
                        // Réindexer les sélections restantes
                        const reindexed: Record<number, JiraAssetObject> = {};
                        Object.keys(newSelectedJiraAssets).forEach((key) => {
                          const oldIndex = parseInt(key);
                          if (oldIndex > index) {
                            reindexed[oldIndex - 1] = newSelectedJiraAssets[oldIndex];
                          } else if (oldIndex < index) {
                            reindexed[oldIndex] = newSelectedJiraAssets[oldIndex];
                          }
                        });
                        setSelectedJiraAssets(reindexed);
                      }}
                      className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Sélection équipement depuis Jira */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      🔍 Rechercher depuis Jira <span className="text-zinc-500">(recommandé)</span>
                    </label>
                    <JiraAssetSelector
                      onSelect={(asset, formData) => handleJiraAssetSelect(index, asset, formData)}
                      placeholder="Tapez pour rechercher un équipement dans Jira (ex: Dell, SN123456, Latitude...)"
                      className="w-full"
                    />
                    {selectedJiraAssets[index] && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-300">
                              Équipement sélectionné depuis Jira
                            </p>
                            <div className="mt-2 space-y-1">
                              {watch(`equipments.${index}.serialNumber`) && (
                                <p className="text-xs text-green-700 dark:text-green-400">
                                  ✓ Numéro de série: <strong>{watch(`equipments.${index}.serialNumber`)}</strong>
                                </p>
                              )}
                              {watch(`equipments.${index}.type`) && (
                                <p className="text-xs text-green-700 dark:text-green-400">
                                  ✓ Type: <strong>{equipmentTypeLabels[watch(`equipments.${index}.type`) as string] || watch(`equipments.${index}.type`)}</strong>
                                </p>
                              )}
                              {watch(`equipments.${index}.internalId`) && (
                                <p className="text-xs text-green-700 dark:text-green-400">
                                  ✓ ID interne: <strong>{watch(`equipments.${index}.internalId`)}</strong>
                                </p>
                              )}
                              {watch(`equipments.${index}.equipmentId`) && (
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                  ℹ️ Cet équipement existe déjà dans le système et a été automatiquement lié.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OU Sélection équipement disponible depuis MongoDB */}
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                          OU
                        </span>
                      </div>
                    </div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 mt-3">
                      Équipement disponible dans le système *
                    </label>
                    <select
                      {...register(`equipments.${index}.equipmentId`)}
                      onChange={(e) => {
                        handleEquipmentSelect(index, e.target.value);
                        // Réinitialiser la sélection Jira si un équipement MongoDB est sélectionné
                        if (e.target.value) {
                          const newSelectedJiraAssets = { ...selectedJiraAssets };
                          delete newSelectedJiraAssets[index];
                          setSelectedJiraAssets(newSelectedJiraAssets);
                        }
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un équipement existant</option>
                      {isLoadingEquipment ? (
                        <option>Chargement...</option>
                      ) : (
                        availableEquipment?.map((eq) => (
                          <option key={eq._id} value={eq._id}>
                            {equipmentTypeLabels[eq.type] || eq.type} - {eq.brand} {eq.model} ({eq.serialNumber})
                          </option>
                        ))
                      )}
                    </select>
                    {errors.equipments?.[index]?.equipmentId && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                        {errors.equipments[index]?.equipmentId?.message as string}
                      </p>
                    )}
                    {!watch(`equipments.${index}.equipmentId`) && !watch(`equipments.${index}.serialNumber`) && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          💡 <strong>Astuce:</strong> Recherchez un équipement depuis Jira pour remplir automatiquement les champs, ou sélectionnez un équipement existant dans le système.
                        </p>
                      </div>
                    )}
                    {errors.equipments?.[index]?.serialNumber && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                        {errors.equipments[index]?.serialNumber?.message as string}
                      </p>
                    )}
                    {errors.equipments?.[index]?.equipmentId && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                        {errors.equipments[index]?.equipmentId?.message as string}
                      </p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Type {selectedJiraAssets[index] && <span className="text-green-600 dark:text-green-400">✓</span>}
                    </label>
                    <input
                      type="text"
                      {...register(`equipments.${index}.type`)}
                      placeholder="Sélectionnez un équipement pour remplir automatiquement"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                        selectedJiraAssets[index] || watch(`equipments.${index}.equipmentId`)
                          ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      } text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      readOnly
                    />
                  </div>

                  {/* Numéro de série */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Numéro de série {selectedJiraAssets[index] && <span className="text-green-600 dark:text-green-400">✓</span>}
                    </label>
                    <input
                      type="text"
                      {...register(`equipments.${index}.serialNumber`)}
                      placeholder="Sélectionnez un équipement pour remplir automatiquement"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border font-mono ${
                        selectedJiraAssets[index] || watch(`equipments.${index}.equipmentId`)
                          ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      } text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      readOnly
                    />
                  </div>

                  {/* Numéro interne */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Numéro interne {selectedJiraAssets[index] && <span className="text-green-600 dark:text-green-400">✓</span>}
                    </label>
                    <input
                      type="text"
                      {...register(`equipments.${index}.internalId`)}
                      placeholder="Ex: PI-1234"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                        selectedJiraAssets[index] && watch(`equipments.${index}.internalId`)
                          ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      } text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>

                  {/* Date de livraison */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Date de livraison
                    </label>
                    <input
                      type="date"
                      {...register(`equipments.${index}.deliveredDate`)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* État */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      État
                    </label>
                    <select
                      {...register(`equipments.${index}.condition`)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bon_etat">Bon état</option>
                      <option value="neuf">Neuf</option>
                      <option value="usure_normale">Usure normale</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.equipments && (
            <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400">
              {errors.equipments.message as string}
            </p>
          )}
        </div>

        {/* Accessoires */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Accessoires
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {standardAccessories.map((accessory) => (
              <label key={accessory} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  value={accessory}
                  checked={watchedAccessories?.includes(accessory) || false}
                  onChange={(e) => {
                    const current = watchedAccessories || [];
                    if (e.target.checked) {
                      setValue('accessories', [...current, accessory]);
                    } else {
                      setValue('accessories', current.filter((a) => a !== accessory));
                    }
                  }}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-5 sm:h-5"
                />
                <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">{accessory}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Services
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {standardServices.map((service) => (
              <label key={service} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  value={service}
                  checked={watchedServices?.includes(service) || false}
                  onChange={(e) => {
                    const current = watchedServices || [];
                    if (e.target.checked) {
                      setValue('services', [...current, service]);
                    } else {
                      setValue('services', current.filter((s) => s !== service));
                    }
                  }}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-5 sm:h-5"
                />
                <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">{service}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Logiciels supplémentaires */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Logiciels supplémentaires
          </label>
          <textarea
            value={watchedAdditionalSoftware?.join(', ') || ''}
            placeholder="Saisissez les logiciels supplémentaires (séparés par des virgules)"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            rows={3}
            onChange={(e) => {
              const value = e.target.value;
              const softwareList = value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
              setValue('additionalSoftware', softwareList, { shouldValidate: true });
            }}
            onBlur={() => {
              // S'assurer que le champ est validé lors de la perte de focus
              const current = watchedAdditionalSoftware || [];
              setValue('additionalSoftware', current, { shouldValidate: true });
            }}
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Séparez les logiciels par des virgules
          </p>
          {errors.additionalSoftware && (
            <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
              {errors.additionalSoftware.message as string}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            placeholder="Notes supplémentaires..."
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={closeModal}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createAllocation.isPending}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || createAllocation.isPending ? 'Création...' : 'Créer l\'allocation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AllocationFormModal;

