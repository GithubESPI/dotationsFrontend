import axiosInstance from './axiosInstance';

export interface CreateReturnData {
    allocationId: string;
    equipmentsReturned: {
        equipmentId: string;
        internalId?: string;
        serialNumber?: string;
        condition: string;
        notes?: string;
        photos?: string[];
    }[];
    returnDate?: string;
    removedSoftware?: string[];
}

export const returnsApi = {
    /**
     * Créer une nouvelle restitution
     */
    create: async (data: CreateReturnData): Promise<any> => {
        const response = await axiosInstance.post('/returns', data);
        return response.data;
    },

    /**
     * Obtenir les restitutions d'un utilisateur
     */
    getByUserId: async (userId: string): Promise<any[]> => {
        const response = await axiosInstance.get(`/returns/user/${userId}`);
        return response.data;
    },

    /**
     * Obtenir les restitutions d'une allocation
     */
    getByAllocationId: async (allocationId: string): Promise<any[]> => {
        const response = await axiosInstance.get(`/returns/allocation/${allocationId}`);
        return response.data;
    },

    /**
     * Obtenir des statistiques
     */
    getStats: async (): Promise<any> => {
        const response = await axiosInstance.get('/returns/stats');
        return response.data;
    },
};
