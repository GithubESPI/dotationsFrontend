'use client';
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAllocationSchema, EquipmentItem } from '../../types/allocation';
import { useAllocationFormStore } from '../../stores/allocationFormStore';
import { useCreateAllocation } from '../../hooks/useAllocations';
import { useAvailableEquipment } from '../../hooks/useEquipment';
import Modal from '../ui/Modal';
import { EquipmentTypeSchema } from '../../types/equipment';
import { z } from 'zod';

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
    }
  }, [selectedEmployee, equipments, reset]);

  const watchedAccessories = watch('accessories');
  const watchedServices = watch('services');
  const watchedAdditionalSoftware = watch('additionalSoftware');

  const onSubmit = async (data: z.infer<typeof CreateAllocationSchema>) => {
    if (!selectedEmployee) return;

    try {
      await createAllocation.mutateAsync(data);
      closeModal();
      reset();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'allocation:', error);
      alert(error?.response?.data?.message || 'Erreur lors de la création de l\'allocation');
    }
  };

  const handleEquipmentSelect = (index: number, equipmentId: string) => {
    const equipment = availableEquipment?.find((eq) => eq._id === equipmentId);
    if (equipment) {
      setValue(`equipments.${index}.equipmentId`, equipment._id);
      setValue(`equipments.${index}.serialNumber`, equipment.serialNumber);
      setValue(`equipments.${index}.internalId`, equipment.internalId || '');
      setValue(`equipments.${index}.type`, equipment.type);
    }
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
              onClick={() =>
                append({
                  equipmentId: '',
                  internalId: '',
                  type: '',
                  serialNumber: '',
                  deliveredDate: new Date().toISOString().split('T')[0],
                  condition: 'bon_etat',
                })
              }
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors whitespace-nowrap"
            >
              + Ajouter un équipement
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-3 sm:p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-3 sm:space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-50">
                    Équipement {index + 1}
                  </h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Sélection équipement disponible */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Équipement disponible *
                    </label>
                    <select
                      {...register(`equipments.${index}.equipmentId`)}
                      onChange={(e) => handleEquipmentSelect(index, e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un équipement</option>
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
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Type
                    </label>
                    <input
                      type="text"
                      {...register(`equipments.${index}.type`)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  {/* Numéro de série */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Numéro de série
                    </label>
                    <input
                      type="text"
                      {...register(`equipments.${index}.serialNumber`)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  {/* Numéro interne */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Numéro interne
                    </label>
                    <input
                      type="text"
                      {...register(`equipments.${index}.internalId`)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            {...register('additionalSoftware')}
            placeholder="Saisissez les logiciels supplémentaires (séparés par des virgules)"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            rows={3}
            onChange={(e) => {
              const value = e.target.value;
              const softwareList = value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
              setValue('additionalSoftware', softwareList);
            }}
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Séparez les logiciels par des virgules
          </p>
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

