import axiosInstance from './axiosInstance';
import {
  Equipment,
  SearchEquipmentParams,
  PaginatedEquipmentResponse,
  EquipmentStats,
  CreateEquipment,
} from '../types/equipment';

/**
 * Service API pour les équipements
 */
export const equipmentApi = {
  /**
   * Rechercher des équipements avec filtres et pagination
   */
  search: async (params: SearchEquipmentParams): Promise<PaginatedEquipmentResponse> => {
    const response = await axiosInstance.get<PaginatedEquipmentResponse>('/equipment', {
      params,
    });
    return response.data;
  },

  /**
   * Obtenir tous les équipements
   */
  getAll: async (): Promise<Equipment[]> => {
    const response = await axiosInstance.get<Equipment[]>('/equipment/all');
    return response.data;
  },

  /**
   * Obtenir les équipements disponibles (non affectés)
   */
  getAvailable: async (): Promise<Equipment[]> => {
    const response = await axiosInstance.get<Equipment[]>('/equipment/available');
    return response.data;
  },

  /**
   * Obtenir les statistiques des équipements
   */
  getStats: async (): Promise<EquipmentStats> => {
    const response = await axiosInstance.get<EquipmentStats>('/equipment/stats');
    return response.data;
  },

  /**
   * Obtenir un équipement par son ID
   */
  getById: async (id: string): Promise<Equipment> => {
    const response = await axiosInstance.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  /**
   * Obtenir les équipements d'un utilisateur
   */
  getByUserId: async (userId: string): Promise<Equipment[]> => {
    const response = await axiosInstance.get<Equipment[]>(`/equipment/user/${userId}`);
    return response.data;
  },

  /**
   * Créer un nouvel équipement
   */
  create: async (data: CreateEquipment): Promise<Equipment> => {
    const response = await axiosInstance.post<Equipment>('/equipment', data);
    return response.data;
  },

  /**
   * Mettre à jour un équipement
   */
  update: async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
    const response = await axiosInstance.put<Equipment>(`/equipment/${id}`, data);
    return response.data;
  },

  /**
   * Affecter un équipement à un utilisateur
   */
  assignToUser: async (id: string, userId: string): Promise<Equipment> => {
    const response = await axiosInstance.post<Equipment>(`/equipment/${id}/assign`, {
      userId,
    });
    return response.data;
  },

  /**
   * Libérer un équipement (le rendre disponible)
   */
  release: async (id: string): Promise<Equipment> => {
    const response = await axiosInstance.post<Equipment>(`/equipment/${id}/release`);
    return response.data;
  },

  /**
   * Supprimer un équipement
   */
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/equipment/${id}`);
  },
};

