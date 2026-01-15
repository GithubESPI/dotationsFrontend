'use client';
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import { useCreateReturn } from '../../hooks/useReturns';
import { useGenerateReturnPDF } from '../../hooks/usePdf';
import { Allocation } from '../../types/allocation';

const EquipmentReturnedSchema = z.object({
    equipmentId: z.string(),
    serialNumber: z.string().optional(),
    internalId: z.string().optional(),
    condition: z.string().min(1, 'L\'état est requis'),
    notes: z.string().optional(),
    selected: z.boolean(),
});

const CreateReturnSchema = z.object({
    allocationId: z.string(),
    returnDate: z.string(),
    equipmentsReturned: z.array(EquipmentReturnedSchema).refine((items) => items.some(item => item.selected), {
        message: "Vous devez sélectionner au moins un équipement à restituer"
    }),
    removedSoftware: z.array(z.string()).optional(),
});

type CreateReturnForm = z.infer<typeof CreateReturnSchema>;

interface ReturnFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    allocation: Allocation | null;
}

const ReturnFormModal: React.FC<ReturnFormModalProps> = ({
    isOpen,
    onClose,
    allocation,
}) => {
    const createReturn = useCreateReturn();
    const generateReturnPDF = useGenerateReturnPDF();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm<CreateReturnForm>({
        resolver: zodResolver(CreateReturnSchema),
        defaultValues: {
            returnDate: new Date().toISOString().split('T')[0],
            equipmentsReturned: [],
        },
    });

    const { fields } = useFieldArray({
        control,
        name: 'equipmentsReturned',
    });

    // Initialiser le formulaire avec les équipements de l'allocation
    useEffect(() => {
        if (allocation) {
            reset({
                allocationId: allocation._id,
                returnDate: new Date().toISOString().split('T')[0],
                equipmentsReturned: allocation.equipments.map(eq => {
                    // Gérer le cas où equipmentId est un objet ou un string
                    const eqId = typeof eq.equipmentId === 'string' ? eq.equipmentId : eq.equipmentId._id;
                    const sn = typeof eq.equipmentId === 'object' ? eq.equipmentId.serialNumber : eq.serialNumber;

                    return {
                        equipmentId: eqId,
                        serialNumber: sn || '',
                        internalId: eq.internalId || '',
                        condition: 'bon_etat',
                        notes: '',
                        selected: true,
                    };
                }),
            });
        }
    }, [allocation, reset]);

    const onSubmit = async (data: CreateReturnForm) => {
        // Filtrer pour ne garder que les équipements sélectionnés
        const selectedEquipments = data.equipmentsReturned.filter(item => item.selected);

        // Préparer les données pour l'API (retirer le champ 'selected')
        const apiData = {
            allocationId: data.allocationId,
            returnDate: data.returnDate,
            equipmentsReturned: selectedEquipments.map(({ selected, ...rest }) => rest),
            removedSoftware: data.removedSoftware
        };

        try {
            const newReturn = await createReturn.mutateAsync(apiData);

            // Générer le PDF de restitution
            if (newReturn && newReturn._id) {
                try {
                    await generateReturnPDF.mutateAsync(newReturn._id);
                } catch (e) {
                    console.error("Erreur génération PDF restitution", e);
                    alert("Restitution créée mais échec de la génération du PDF.");
                }
            }

            onClose();
        } catch (error: any) {
            console.error('Erreur restitution:', error);
            alert(error?.response?.data?.message || 'Erreur lors de la restitution');
        }
    };

    if (!allocation) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Restitution - Allocation du ${new Date(allocation.deliveryDate).toLocaleDateString()}`}
            size="xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Date de restitution
                    </label>
                    <input
                        type="date"
                        {...register('returnDate')}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    />
                </div>

                <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
                        Matériel à restituer
                    </h3>
                    <div className="space-y-4">
                        {errors.equipmentsReturned && (
                            <p className="text-sm text-red-600 mb-2">{errors.equipmentsReturned.message}</p>
                        )}
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="flex items-start gap-4 mb-4">
                                    <input
                                        type="checkbox"
                                        {...register(`equipmentsReturned.${index}.selected`)}
                                        className="mt-1 w-5 h-5 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-black dark:text-white">
                                            {watch(`equipmentsReturned.${index}.serialNumber`) || 'Sans N/S'}
                                            {watch(`equipmentsReturned.${index}.internalId`) ? ` - ${watch(`equipmentsReturned.${index}.internalId`)}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {watch(`equipmentsReturned.${index}.selected`) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-9">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">État</label>
                                            <select
                                                {...register(`equipmentsReturned.${index}.condition`)}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                            >
                                                <option value="bon_etat">Bon état</option>
                                                <option value="degrade">Dégradé</option>
                                                <option value="endommage">Endommagé</option>
                                                <option value="manquant">Manquant</option>
                                                <option value="detruit">Détruit</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">Notes</label>
                                            <input
                                                type="text"
                                                {...register(`equipmentsReturned.${index}.notes`)}
                                                placeholder="Observations..."
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || createReturn.isPending || generateReturnPDF.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                        {isSubmitting || createReturn.isPending || generateReturnPDF.isPending ? 'Traitement...' : 'Confirmer la restitution'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReturnFormModal;
