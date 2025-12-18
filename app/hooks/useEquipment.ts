import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '../api/equipment';
import {
  SearchEquipmentParams,
  Equipment,
  CreateEquipment,
} from '../types/equipment';

/**
 * Hook pour rechercher des équipements avec filtres et pagination
 */
export const useEquipmentSearch = (params: SearchEquipmentParams) => {
  return useQuery({
    queryKey: ['equipment', 'search', params],
    queryFn: () => equipmentApi.search(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook pour obtenir tous les équipements
 */
export const useEquipmentAll = () => {
  return useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: () => equipmentApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook pour obtenir les équipements disponibles
 */
export const useAvailableEquipment = () => {
  return useQuery({
    queryKey: ['equipment', 'available'],
    queryFn: () => equipmentApi.getAvailable(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook pour obtenir les statistiques des équipements
 */
export const useEquipmentStats = () => {
  return useQuery({
    queryKey: ['equipment', 'stats'],
    queryFn: () => equipmentApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook pour obtenir un équipement par ID
 */
export const useEquipment = (id: string | undefined) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook pour obtenir les équipements d'un utilisateur
 */
export const useEquipmentByUserId = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['equipment', 'user', userId],
    queryFn: () => equipmentApi.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook pour créer un équipement
 */
export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEquipment) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

/**
 * Hook pour mettre à jour un équipement
 */
export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) =>
      equipmentApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
    },
  });
};

/**
 * Hook pour affecter un équipement à un utilisateur
 */
export const useAssignEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      equipmentApi.assignToUser(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
    },
  });
};

/**
 * Hook pour libérer un équipement
 */
export const useReleaseEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => equipmentApi.release(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

/**
 * Hook pour supprimer un équipement
 */
export const useRemoveEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => equipmentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

