import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { returnsApi, CreateReturnData } from '../api/returns';

/**
 * Hook pour créer une restitution
 */
export const useCreateReturn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReturnData) => returnsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

/**
 * Hook pour obtenir les restitutions d'un utilisateur
 */
export const useReturnsByUserId = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['returns', 'user', userId],
        queryFn: () => returnsApi.getByUserId(userId!),
        enabled: !!userId,
    });
};

/**
 * Hook pour obtenir les restitutions d'une allocation
 */
export const useReturnsByAllocationId = (allocationId: string | undefined) => {
    return useQuery({
        queryKey: ['returns', 'allocation', allocationId],
        queryFn: () => returnsApi.getByAllocationId(allocationId!),
        enabled: !!allocationId,
    });
};

/**
 * Hook pour obtenir les statistiques
 */
export const useReturnStats = () => {
    return useQuery({
        queryKey: ['returns', 'stats'],
        queryFn: () => returnsApi.getStats(),
    });
};
