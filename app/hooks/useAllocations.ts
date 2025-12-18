import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allocationsApi } from '../api/allocations';
import {
  SearchAllocationParams,
  CreateAllocation,
  SignAllocation,
} from '../types/allocation';

/**
 * Hook pour rechercher des allocations avec filtres et pagination
 */
export const useAllocationsSearch = (params: SearchAllocationParams) => {
  return useQuery({
    queryKey: ['allocations', 'search', params],
    queryFn: () => allocationsApi.search(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook pour obtenir toutes les allocations
 */
export const useAllocationsAll = () => {
  return useQuery({
    queryKey: ['allocations', 'all'],
    queryFn: () => allocationsApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook pour obtenir une allocation par ID
 */
export const useAllocation = (id: string | undefined) => {
  return useQuery({
    queryKey: ['allocations', id],
    queryFn: () => allocationsApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook pour obtenir les allocations d'un utilisateur
 */
export const useAllocationsByUserId = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['allocations', 'user', userId],
    queryFn: () => allocationsApi.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook pour créer une allocation
 */
export const useCreateAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAllocation) => allocationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

/**
 * Hook pour mettre à jour une allocation
 */
export const useUpdateAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAllocation> }) =>
      allocationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['allocations', variables.id] });
    },
  });
};

/**
 * Hook pour signer une allocation
 */
export const useSignAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignAllocation }) =>
      allocationsApi.sign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['allocations', variables.id] });
    },
  });
};

/**
 * Hook pour obtenir les statistiques des allocations
 */
export const useAllocationStats = () => {
  return useQuery({
    queryKey: ['allocations', 'stats'],
    queryFn: () => allocationsApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

