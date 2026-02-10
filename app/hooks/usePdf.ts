import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pdfApi } from '../api/pdf';

/**
 * Hook pour générer le PDF de dotation
 */
export const useGenerateAllocationPDF = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ allocationId, signatureData }: { allocationId: string, signatureData?: any }) =>
            pdfApi.generateAllocationPDF(allocationId, signatureData),
        onSuccess: () => {
            // Invalider les allocations pour mettre à jour le statut du document si nécessaire (non implémenté ici mais bonne pratique)
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            queryClient.invalidateQueries({ queryKey: ['users'] }); // Mise à jour de l'historique utilisateur
        },
    });
};

/**
 * Hook pour générer le PDF de restitution
 */
export const useGenerateReturnPDF = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (returnId: string) => pdfApi.generateReturnPDF(returnId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
