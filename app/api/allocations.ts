import axiosInstance from './axiosInstance';
import {
  Allocation,
  SearchAllocationParams,
  PaginatedAllocationResponse,
  CreateAllocation,
  SignAllocation,
} from '../types/allocation';

/**
 * Service API pour les allocations
 */
export const allocationsApi = {
  /**
   * Rechercher des allocations avec filtres et pagination
   */
  search: async (params: SearchAllocationParams): Promise<PaginatedAllocationResponse> => {
    const response = await axiosInstance.get<PaginatedAllocationResponse>('/allocations', {
      params,
    });
    return response.data;
  },

  /**
   * Obtenir toutes les allocations
   */
  getAll: async (): Promise<Allocation[]> => {
    const response = await axiosInstance.get<Allocation[]>('/allocations/all');
    return response.data;
  },

  /**
   * Obtenir une allocation par son ID
   */
  getById: async (id: string): Promise<Allocation> => {
    const response = await axiosInstance.get<Allocation>(`/allocations/${id}`);
    return response.data;
  },

  /**
   * Obtenir les allocations d'un utilisateur
   */
  getByUserId: async (userId: string): Promise<Allocation[]> => {
    const response = await axiosInstance.get<Allocation[]>(`/allocations/user/${userId}`);
    return response.data;
  },

  /**
   * Créer une nouvelle allocation
   */
  create: async (data: CreateAllocation): Promise<Allocation> => {
    const response = await axiosInstance.post<Allocation>('/allocations', data);
    return response.data;
  },

  /**
   * Mettre à jour une allocation
   */
  update: async (id: string, data: Partial<CreateAllocation>): Promise<Allocation> => {
    const response = await axiosInstance.put<Allocation>(`/allocations/${id}`, data);
    return response.data;
  },

  /**
   * Signer une allocation
   */
  sign: async (id: string, data: SignAllocation): Promise<Allocation> => {
    const response = await axiosInstance.post<Allocation>(`/allocations/${id}/sign`, data);
    return response.data;
  },

  /**
   * Obtenir les statistiques des allocations
   */
  getStats: async () => {
    const response = await axiosInstance.get('/allocations/stats');
    return response.data;
  },
};

