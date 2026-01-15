import axiosInstance from './axiosInstance';

export const pdfApi = {
    /**
     * Générer le PDF de dotation pour une allocation
     */
    generateAllocationPDF: async (allocationId: string): Promise<any> => {
        const response = await axiosInstance.post(`/pdf/allocation/${allocationId}`);
        return response.data;
    },

    /**
     * Générer le PDF de restitution
     */
    generateReturnPDF: async (returnId: string): Promise<any> => {
        const response = await axiosInstance.post(`/pdf/return/${returnId}`);
        return response.data;
    },

    /**
     * Récupérer un document PDF
     */
    getPDF: async (documentId: string): Promise<Blob> => {
        const response = await axiosInstance.get(`/pdf/document/${documentId}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
