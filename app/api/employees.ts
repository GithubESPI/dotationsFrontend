import axiosInstance from './axiosInstance';
import {
  Employee,
  SearchEmployeeParams,
  PaginatedEmployeesResponse,
  EmployeeStats,
  SyncResponse,
  SyncPhotosResponse,
} from '../types/employee';

/**
 * Service API pour les employés
 */
export const employeesApi = {
  /**
   * Rechercher des employés avec filtres et pagination
   */
  search: async (params: SearchEmployeeParams): Promise<PaginatedEmployeesResponse> => {
    const response = await axiosInstance.get<PaginatedEmployeesResponse>('/employees', {
      params,
    });
    return response.data;
  },

  /**
   * Obtenir tous les employés actifs
   */
  getAll: async (): Promise<Employee[]> => {
    const response = await axiosInstance.get<Employee[]>('/employees/all');
    return response.data;
  },

  /**
   * Obtenir les statistiques des employés
   */
  getStats: async (): Promise<EmployeeStats> => {
    const response = await axiosInstance.get<EmployeeStats>('/employees/stats');
    return response.data;
  },

  /**
   * Obtenir un employé par son ID
   */
  getById: async (id: string): Promise<Employee> => {
    const response = await axiosInstance.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Synchroniser les employés depuis Office 365
   */
  sync: async (token?: string): Promise<SyncResponse> => {
    // Si pas de token fourni, essayer de le récupérer depuis localStorage
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('azure_access_token') || undefined;
    }

    const response = await axiosInstance.post<SyncResponse>('/employees/sync', {
      token,
    });
    return response.data;
  },

  /**
   * Synchroniser les photos de profil des employés
   */
  syncPhotos: async (token?: string, batchSize: number = 50, maxUsers: number = 100): Promise<SyncPhotosResponse> => {
    // Si pas de token fourni, essayer de le récupérer depuis localStorage
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('azure_access_token') || undefined;
    }

    const response = await axiosInstance.post<SyncPhotosResponse>('/employees/sync-photos', {
      token,
    }, {
      params: {
        batchSize,
        maxUsers
      }
    });
    return response.data;
  },

  /**
   * Mettre à jour un employé
   */
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await axiosInstance.put<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * Désactiver un employé
   */
  deactivate: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/employees/${id}`);
  },
};

