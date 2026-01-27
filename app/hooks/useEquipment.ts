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
    queryKey: ['equipment', 'all', 'filtered', params],
    queryFn: () => equipmentApi.getAll(),
    select: (allEquipment) => {
      let filtered = [...allEquipment];

      // 1. Filtrage par Recherche (Texte global)
      if (params.query) {
        const lowerQuery = params.query.toLowerCase();
        filtered = filtered.filter(item =>
          item.brand.toLowerCase().includes(lowerQuery) ||
          item.model.toLowerCase().includes(lowerQuery) ||
          item.serialNumber.toLowerCase().includes(lowerQuery) ||
          (item.jiraAttributes && Object.values(item.jiraAttributes).some(v => String(v).toLowerCase().includes(lowerQuery)))
        );
      }

      // 2. Filtrage par Statut
      if (params.status) {
        filtered = filtered.filter(item => {
          const status = item.status?.toUpperCase() || '';
          const jiraStatus = (item.jiraAttributes?.['Status'] as string)?.toUpperCase() || '';
          const paramStatus = params.status?.toUpperCase();

          return status === paramStatus || jiraStatus === paramStatus;
        });
      }

      // 3. Filtrage par Localisation
      if (params.location) {
        const lowerLoc = params.location.toLowerCase();
        filtered = filtered.filter(item => {
          const loc = item.location?.toLowerCase() || '';
          // Vérifier aussi dans les attributs Jira car c'est souvent là que se trouve l'info
          const jiraLoc = (item.jiraAttributes?.['Localisation'] as string)?.toLowerCase() || '';
          return loc.includes(lowerLoc) || jiraLoc.includes(lowerLoc);
        });
      }

      // 4. Filtrage par Type
      if (params.type) {
        filtered = filtered.filter(item => item.type === params.type);
      }

      // 5. Filtrage par Marque (si utilisé spécifiquement)
      if (params.brand) {
        const lowerBrand = params.brand.toLowerCase();
        filtered = filtered.filter(item => item.brand.toLowerCase().includes(lowerBrand));
      }

      // 6. Pagination
      const total = filtered.length;
      const limit = params.limit || 20;
      const page = params.page || 1;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    },
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

