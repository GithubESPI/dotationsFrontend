'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAllocationSchema, CreateAllocation, EquipmentItem } from '../../types/allocation';
import { useAllocationFormStore } from '../../stores/allocationFormStore';
import { useCreateAllocation, useSignAllocation, useUpdateAllocation } from '../../hooks/useAllocations';
import { useGenerateAllocationPDF } from '../../hooks/usePdf';
import { useAvailableEquipment } from '../../hooks/useEquipment';
import Modal from '../ui/Modal';
import { EquipmentTypeSchema } from '../../types/equipment';
import { z } from 'zod';

import LocalEquipmentSearch from './LocalEquipmentSearch';
import dynamic from 'next/dynamic';

const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false }) as any;

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

import EquipmentTypeSelectionModal from './EquipmentTypeSelectionModal';

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
  const updateAllocation = useUpdateAllocation();
  const signAllocation = useSignAllocation();
  const generateAllocationPDF = useGenerateAllocationPDF();
  const { data: availableEquipment, isLoading: isLoadingEquipment } = useAvailableEquipment();

  // State pour le modal de sélection de type
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  const [step, setStep] = useState<'FORM' | 'PREVIEW'>('FORM');
  const sigPad = useRef<any>(null); // Type 'any' car le type SignatureCanvas est dynamique
  const [isSigning, setIsSigning] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(CreateAllocationSchema),
    defaultValues: {
      userId: selectedEmployee?._id || '',
      equipments: equipments.length > 0 ? equipments : [], // On commence vide ou avec les équipements du store
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

  // Fonction pour gérer l'ajout d'un équipement après sélection du type
  const handleTypeSelect = (type: string) => {
    append({
      equipmentId: '',
      internalId: '',
      type: type, // Pré-remplir le type
      serialNumber: '',
      deliveredDate: new Date().toISOString().split('T')[0],
      condition: 'bon_etat',
    });
    setIsTypeSelectionOpen(false);
  };

  useEffect(() => {
    if (selectedEmployee) {
      reset({
        userId: selectedEmployee._id,
        equipments: equipments.length > 0 ? equipments : [],
        deliveryDate: new Date().toISOString().split('T')[0],
        accessories: [],
        additionalSoftware: [],
        services: [],
        notes: '',
      });
      setStep('FORM');
      setIsSigning(false);
    }
  }, [selectedEmployee, equipments, reset]);

  const watchedAccessories = watch('accessories');
  const watchedServices = watch('services');
  const watchedAdditionalSoftware = watch('additionalSoftware');

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep('PREVIEW');
    }
  };

  const handleBack = () => {
    setStep('FORM');
  };

  const handleClearSignature = () => {
    sigPad.current?.clear();
  };

  const handleSignAndSubmit = async () => {
    if (sigPad.current?.isEmpty()) {
      alert("Veuillez signer avant de valider.");
      return;
    }

    const signatureDataUrl = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
    if (!signatureDataUrl) {
      alert("Erreur lors de la récupération de la signature.");
      return;
    }

    setIsSigning(true);
    const data = getValues();

    if (!selectedEmployee) {
      alert('Aucun employé sélectionné');
      setIsSigning(false);
      return;
    }

    try {
      // 1. Préparer les données
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
          if (eq.jiraAssetId) {
            cleaned.jiraAssetId = eq.jiraAssetId;
          }

          // Validation finale : au moins equipmentId OU serialNumber doit être présent
          if (!cleaned.equipmentId && !cleaned.serialNumber) {
            throw new Error(`L'équipement ${index + 1} doit avoir un numéro de série ou un ID d'équipement`);
          }

          return cleaned;
        }),
        deliveryDate: data.deliveryDate || new Date().toISOString().split('T')[0],
        accessories: Array.isArray(data.accessories) ? data.accessories : [],
        additionalSoftware: Array.isArray(data.additionalSoftware) ? data.additionalSoftware : [],
        services: Array.isArray(data.services) ? data.services : [],
        notes: data.notes && data.notes.trim().length > 0 ? data.notes.trim() : undefined,
        // status: 'EN_COURS', // Retiré car cause une erreur 400 sur le backend
      };

      console.log('Données à envoyer:', cleanedData);

      // 2. Créer l'allocation
      const newAllocation = await createAllocation.mutateAsync(cleanedData);

      if (newAllocation && newAllocation._id) {


        // 3. Signer l'allocation
        await signAllocation.mutateAsync({
          id: newAllocation._id,
          data: {
            signerName: selectedEmployee.displayName,
            signatureImage: signatureDataUrl,
          },
        });

        // 4. Générer le PDF
        try {
          await generateAllocationPDF.mutateAsync({
            allocationId: newAllocation._id,
            signatureData: {
              signerName: selectedEmployee.displayName,
              signatureImage: signatureDataUrl,
              signedAt: new Date().toISOString(),
            }
          });
        } catch (e) {
          console.error("Erreur génération PDF", e);
          alert("Allocation créée et signée avec succès, mais échec de la génération du PDF. Veuillez contacter le support.");
        }
      }

      closeModal();
      reset();
      setStep('FORM');
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'allocation:', error);
      let errorMessage = 'Erreur lors de la création de l\'allocation';
      if (error?.response?.data?.message) errorMessage = error.response.data.message;
      else if (error?.message) errorMessage = error.message;
      alert(errorMessage);
    } finally {
      setIsSigning(false);
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

  // Gérer la sélection d'un équipement depuis la recherche locale
  const handleLocalEquipmentSelect = (index: number, equipment: any) => {
    setValue(`equipments.${index}.equipmentId`, equipment._id);
    setValue(`equipments.${index}.serialNumber`, equipment.serialNumber);
    setValue(`equipments.${index}.internalId`, equipment.internalId || '');
    // setValue(`equipments.${index}.type`, equipment.type); // On garde le type sélectionné manuellement ou on le laisse correspondre
    if (equipment.brand) setValue(`equipments.${index}.brand`, equipment.brand);
    if (equipment.model) setValue(`equipments.${index}.model`, equipment.model);

    // On conserve aussi le jiraAssetId si présent
    if (equipment.jiraAssetId) {
      setValue(`equipments.${index}.jiraAssetId`, equipment.jiraAssetId);
    } else {
      setValue(`equipments.${index}.jiraAssetId`, '');
    }
  };


  if (!selectedEmployee) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={step === 'FORM' ? `Affecter du matériel à ${selectedEmployee.displayName}` : `Vérification et Signature - ${selectedEmployee.displayName}`}
        size="xl"
      >
        {step === 'FORM' ? (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4 sm:space-y-6 pb-4">
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
                  onClick={() => setIsTypeSelectionOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Ajouter un équipement
                </button>
              </div>

              {/* Si aucun équipement, message d'incitation */}
              {fields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Aucun équipement sélectionné. Cliquez sur "Ajouter un équipement" pour commencer.
                  </p>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-4 transition-all ${watch(`equipments.${index}.equipmentId`)
                      ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10'
                      : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-50">
                          Équipement {index + 1}
                        </h4>
                        {/* Badge du type si présent */}
                        {watch(`equipments.${index}.type`) && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                            {equipmentTypeLabels[watch(`equipments.${index}.type`) as string] || watch(`equipments.${index}.type`)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          remove(index);
                        }}
                        className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Supprimer
                      </button>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Sélection équipement (Locale avec attributs Jira) */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          🔍 Rechercher un {equipmentTypeLabels[watch(`equipments.${index}.type`) as string] || 'équipement'}
                        </label>
                        <LocalEquipmentSearch
                          onSelect={(eq) => handleLocalEquipmentSelect(index, eq)}
                          placeholder={`Recherchez un ${equipmentTypeLabels[watch(`equipments.${index}.type`) as string]?.toLowerCase() || 'équipement'}...`}
                          className="w-full"
                          // Exclure les équipements déjà sélectionnés dans d'autres lignes
                          excludeIds={
                            watch('equipments')
                              .map((e, i) => i !== index ? e.equipmentId : undefined)
                              .filter((id): id is string => !!id)
                          }
                          // Filtrer par le type sélectionné
                          typeFilter={watch(`equipments.${index}.type`)}
                        />

                        {watch(`equipments.${index}.equipmentId`) && (
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
                                  Équipement sélectionné
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
                                </div>
                              </div>
                              {/* Bouton pour désélectionner - Optionnel mais pratique */}
                              <button
                                type="button"
                                onClick={() => {
                                  setValue(`equipments.${index}.equipmentId`, '');
                                  setValue(`equipments.${index}.serialNumber`, '');
                                  setValue(`equipments.${index}.internalId`, '');
                                  // setValue(`equipments.${index}.type`, ''); // Ne pas reset le type car c'est la base de la ligne
                                  setValue(`equipments.${index}.brand`, '');
                                  setValue(`equipments.${index}.model`, '');
                                }}
                                className="text-xs text-red-500 hover:text-red-700 underline"
                              >
                                Retirer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Type - Lecture seule maintenant car défini par le modal */}
                      <div className="hidden"> {/* On cache le champ type car il est montré en haut et géré par le modal */}
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Type
                        </label>
                        <input
                          type="text"
                          {...register(`equipments.${index}.type`)}
                          className="hidden"
                          readOnly
                        />
                      </div>

                      {/* Numéro de série */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Numéro de série {watch(`equipments.${index}.equipmentId`) && <span className="text-green-600 dark:text-green-400">✓</span>}
                        </label>
                        <input
                          type="text"
                          {...register(`equipments.${index}.serialNumber`)}
                          placeholder="Sélectionnez un équipement..."
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border font-mono ${watch(`equipments.${index}.equipmentId`)
                            ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                            } text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          readOnly // Toujours readonly, on force la sélection via la recherche
                        />
                      </div>

                      {/* Numéro interne */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Numéro interne {watch(`equipments.${index}.equipmentId`) && <span className="text-green-600 dark:text-green-400">✓</span>}
                        </label>
                        <input
                          type="text"
                          {...register(`equipments.${index}.internalId`)}
                          placeholder="Ex: PI-1234"
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${watch(`equipments.${index}.internalId`) && watch(`equipments.${index}.equipmentId`)
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
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Récapitulatif</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-zinc-500 dark:text-zinc-400">Équipements</span>
                  <ul className="list-disc list-inside text-zinc-800 dark:text-zinc-200">
                    {watch('equipments').map((eq, i) => (
                      <li key={i}>{equipmentTypeLabels[eq.type as string] || eq.type} - {eq.serialNumber || 'N/A'}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Signature de l'employé *
              </label>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden relative" style={{ height: 200 }}>
                <SignatureCanvas
                  ref={sigPad}
                  penColor="black"
                  canvasProps={{
                    className: 'signature-canvas w-full h-full',
                    style: { width: '100%', height: '100%' }
                  }}
                />
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="absolute top-2 right-2 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
                >
                  Effacer
                </button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Utilisez votre souris ou votre doigt pour signer dans le cadre ci-dessus.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleSignAndSubmit}
                disabled={isSigning || createAllocation.isPending || signAllocation.isPending || generateAllocationPDF.isPending}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSigning || createAllocation.isPending || signAllocation.isPending || generateAllocationPDF.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Valider et Signer'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de sélection du type d'équipement */}
      <EquipmentTypeSelectionModal
        isOpen={isTypeSelectionOpen}
        onClose={() => setIsTypeSelectionOpen(false)}
        onSelect={handleTypeSelect}
      />
    </>
  );
};

export default AllocationFormModal;
