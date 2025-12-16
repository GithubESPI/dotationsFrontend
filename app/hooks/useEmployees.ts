import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees';
import { SearchEmployeeParams, Employee } from '../types/employee';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook pour rechercher des employés avec filtres et pagination
 */
export const useEmployeesSearch = (params: SearchEmployeeParams) => {
  return useQuery({
    queryKey: ['employees', 'search', params],
    queryFn: () => employeesApi.search(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook pour obtenir tous les employés actifs
 */
export const useEmployeesAll = () => {
  return useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeesApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook pour obtenir les statistiques des employés
 */
export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employees', 'stats'],
    queryFn: () => employeesApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook pour obtenir un employé par ID
 */
export const useEmployee = (id: string | undefined) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeesApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook pour synchroniser les employés depuis Office 365
 */
export const useSyncEmployees = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (token?: string) => {
      // Si pas de token fourni, essayer de récupérer depuis le localStorage
      let azureToken = token;
      if (!azureToken && typeof window !== 'undefined') {
        azureToken = localStorage.getItem('azure_access_token') || undefined;
      }
      return employeesApi.sync(azureToken);
    },
    onSuccess: () => {
      // Invalider toutes les requêtes d'employés après synchronisation
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Hook pour mettre à jour un employé
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
    },
  });
};

/**
 * Hook pour désactiver un employé
 */
export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

