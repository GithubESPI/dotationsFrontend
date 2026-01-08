'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEquipmentSchema, EquipmentTypeSchema, EquipmentStatusSchema } from '../../types/equipment';
import { useCreateEquipment, useUpdateEquipment, useEquipment } from '../../hooks/useEquipment';
import Modal from '../ui/Modal';
import JiraAssetSelector from './JiraAssetSelector';
import { JiraAssetObject } from '../../types/jira-asset';
import { z } from 'zod';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: string; // Si fourni, mode édition
  onSuccess?: () => void;
}

const equipmentTypeLabels: Record<string, string> = {
  PC_PORTABLE: 'PC Portable',
  PC_FIXE: 'PC Fixe',
  TABLETTE: 'Tablette',
  MOBILE: 'Mobile',
  ECRAN: 'Écran',
  TELEPHONE_IP: 'Téléphone IP',
  AUTRES: 'Autres',
};

const equipmentStatusLabels: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  AFFECTE: 'Affecté',
  EN_REPARATION: 'En réparation',
  RESTITUE: 'Restitué',
  PERDU: 'Perdu',
  DETRUIT: 'Détruit',
};

const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  onClose,
  equipmentId,
  onSuccess,
}) => {
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const { data: existingEquipment, isLoading: isLoadingEquipment } = useEquipment(
    equipmentId || undefined
  );
  const [selectedJiraAsset, setSelectedJiraAsset] = useState<JiraAssetObject | null>(null);
  const [isLoadingMapping, setIsLoadingMapping] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(CreateEquipmentSchema),
    defaultValues: {
      jiraAssetId: '',
      internalId: '',
      type: 'PC_PORTABLE' as const,
      brand: '',
      model: '',
      serialNumber: '',
      imei: '',
      phoneLine: '',
      status: 'DISPONIBLE' as const,
      currentUserId: '',
      location: '',
      additionalSoftwares: [],
    },
  });

  // Charger les données de l'équipement existant en mode édition
  useEffect(() => {
    if (isOpen && equipmentId && existingEquipment) {
      reset({
        jiraAssetId: existingEquipment.jiraAssetId || '',
        internalId: existingEquipment.internalId || '',
        type: existingEquipment.type,
        brand: existingEquipment.brand,
        model: existingEquipment.model,
        serialNumber: existingEquipment.serialNumber,
        imei: existingEquipment.imei || '',
        phoneLine: existingEquipment.phoneLine || '',
        status: existingEquipment.status,
        currentUserId: existingEquipment.currentUserId || '',
        location: existingEquipment.location || '',
        additionalSoftwares: existingEquipment.additionalSoftwares || [],
      });
    } else if (isOpen && !equipmentId) {
      // Réinitialiser pour création
      reset({
        jiraAssetId: '',
        internalId: '',
        type: 'PC_PORTABLE',
        brand: '',
        model: '',
        serialNumber: '',
        imei: '',
        phoneLine: '',
        status: 'DISPONIBLE',
        currentUserId: '',
        location: '',
        additionalSoftwares: [],
      });
      setSelectedJiraAsset(null);
    }
  }, [isOpen, equipmentId, existingEquipment, reset]);

  // Mapper le type depuis Jira vers notre enum
  const mapJiraTypeToEquipmentType = (jiraType?: string): string => {
    if (!jiraType) return 'PC_PORTABLE';

    const lowerType = jiraType.toLowerCase();
    if (lowerType.includes('laptop') || lowerType.includes('portable')) return 'PC_PORTABLE';
    if (lowerType.includes('desktop') || lowerType.includes('fixe')) return 'PC_FIXE';
    if (lowerType.includes('tablet')) return 'TABLETTE';
    if (lowerType.includes('mobile') || lowerType.includes('phone')) return 'MOBILE';
    if (lowerType.includes('screen') || lowerType.includes('écran') || lowerType.includes('monitor')) return 'ECRAN';
    if (lowerType.includes('ip phone') || lowerType.includes('téléphone ip')) return 'TELEPHONE_IP';
    return 'AUTRES';
  };

  // Mapper le statut depuis Jira vers notre enum
  const mapJiraStatusToEquipmentStatus = (jiraStatus?: string): string => {
    if (!jiraStatus) return 'DISPONIBLE';

    const lowerStatus = jiraStatus.toLowerCase();
    if (lowerStatus.includes('disponible') || lowerStatus.includes('available')) return 'DISPONIBLE';
    if (lowerStatus.includes('affecté') || lowerStatus.includes('assigned')) return 'AFFECTE';
    if (lowerStatus.includes('réparation') || lowerStatus.includes('repair') || lowerStatus.includes('maintenance')) return 'EN_REPARATION';
    if (lowerStatus.includes('restitue') || lowerStatus.includes('returned')) return 'RESTITUE';
    if (lowerStatus.includes('perdu') || lowerStatus.includes('lost')) return 'PERDU';
    if (lowerStatus.includes('détruit') || lowerStatus.includes('destroyed')) return 'DETRUIT';
    return 'DISPONIBLE';
  };

  const handleJiraAssetSelect = async (asset: JiraAssetObject, formData: any) => {
    setSelectedJiraAsset(asset);

    // Remplir automatiquement les champs du formulaire
    if (formData.serialNumber) {
      setValue('serialNumber', formData.serialNumber, { shouldValidate: true });
    }
    if (formData.brand) {
      setValue('brand', formData.brand, { shouldValidate: true });
    }
    if (formData.model) {
      setValue('model', formData.model, { shouldValidate: true });
    }
    if (formData.internalId) {
      setValue('internalId', formData.internalId);
    }
    if (formData.type) {
      const mappedType = mapJiraTypeToEquipmentType(formData.type);
      setValue('type', mappedType as any, { shouldValidate: true });
    }
    if (formData.status) {
      const mappedStatus = mapJiraStatusToEquipmentStatus(formData.status);
      setValue('status', mappedStatus as any, { shouldValidate: true });
    }

    // Toujours définir le jiraAssetId
    setValue('jiraAssetId', asset.id);
  };

  const onSubmit = async (data: z.infer<typeof CreateEquipmentSchema>) => {
    try {
      if (equipmentId) {
        await updateEquipment.mutateAsync({ id: equipmentId, data });
      } else {
        await createEquipment.mutateAsync(data);
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    }
  };

  const watchedBrand = watch('brand');
  const watchedModel = watch('model');
  const watchedSerialNumber = watch('serialNumber');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={equipmentId ? 'Modifier l\'équipement' : 'Créer un équipement'}
      size="lg"
    >
      {isLoadingEquipment ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <div className="text-lg text-zinc-600 dark:text-zinc-400">
              Chargement des données...
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sélecteur Jira Asset - Seulement en mode création */}
          {!equipmentId && (
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                🔍 Rechercher depuis Jira <span className="text-zinc-500">(optionnel)</span>
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                Tapez le nom, le numéro de série ou la marque d'un équipement pour le rechercher dans Jira.
                Les champs seront automatiquement remplis une fois sélectionné.
              </p>
              <JiraAssetSelector
                onSelect={handleJiraAssetSelect}
                placeholder="Tapez pour rechercher un équipement dans Jira (ex: Dell, SN123456, Latitude...)"
                className="w-full"
              />
              {selectedJiraAsset && (
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
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        Les champs ont été remplis automatiquement. Vous pouvez les modifier si nécessaire.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Indicateur de mode édition */}
          {equipmentId && existingEquipment && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                ✏️ Mode édition - Modification de l'équipement existant
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type d'équipement */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Type d'équipement <span className="text-red-500">*</span>
              </label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {Object.entries(equipmentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Statut
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {Object.entries(equipmentStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Marque */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Marque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('brand')}
                placeholder="Ex: Dell, HP, Lenovo..."
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.brand.message}</p>
              )}
            </div>

            {/* Modèle */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Modèle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('model')}
                placeholder="Ex: Latitude 5520, ThinkPad X1..."
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model.message}</p>
              )}
            </div>

            {/* Numéro de série */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Numéro de série <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('serialNumber')}
                placeholder="Ex: SN123456789"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
              />
              {errors.serialNumber && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.serialNumber.message}
                </p>
              )}
            </div>

            {/* ID interne */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                ID interne
              </label>
              <input
                type="text"
                {...register('internalId')}
                placeholder="Ex: PI-1234"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* IMEI (pour mobile/tablette) */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                IMEI
              </label>
              <input
                type="text"
                {...register('imei')}
                placeholder="Pour mobile/tablette"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
              />
            </div>

            {/* Ligne téléphonique */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Ligne téléphonique
              </label>
              <input
                type="text"
                {...register('phoneLine')}
                placeholder="Pour téléphone IP"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Localisation
              </label>
              <input
                type="text"
                {...register('location')}
                placeholder="Ex: Bureau Paris, Site Lyon..."
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Informations pré-remplies depuis Jira */}
          {selectedJiraAsset && (watchedBrand || watchedModel || watchedSerialNumber) && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                📋 Informations pré-remplies depuis Jira
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
                {watchedBrand && <div>Marque: <strong>{watchedBrand}</strong></div>}
                {watchedModel && <div>Modèle: <strong>{watchedModel}</strong></div>}
                {watchedSerialNumber && <div>N° série: <strong>{watchedSerialNumber}</strong></div>}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                Vous pouvez modifier ces valeurs si nécessaire
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createEquipment.isPending || updateEquipment.isPending}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || createEquipment.isPending || updateEquipment.isPending
                ? 'Enregistrement...'
                : equipmentId
                  ? 'Modifier'
                  : 'Créer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EquipmentFormModal;

