import axiosInstance from './axiosInstance';

/**
 * Service pour les appels API d'authentification
 */
export const authApi = {
  /**
   * Tester l'authentification avec un token Azure AD
   */
  testAuth: async (azureToken: string) => {
    const response = await axiosInstance.post('/auth/test', { azureToken });
    return response.data;
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  /**
   * Récupérer le profil depuis Microsoft Graph
   */
  getGraphProfile: async (token?: string) => {
    const params = token ? { token } : {};
    const response = await axiosInstance.get('/auth/graph/profile', { params });
    return response.data;
  },

  /**
   * Récupérer la photo depuis Microsoft Graph
   */
  getGraphPhoto: async (token?: string) => {
    const params = token ? { token } : {};
    const response = await axiosInstance.get('/auth/graph/photo', { params });
    return response.data;
  },

  /**
   * Récupérer les groupes depuis Microsoft Graph
   */
  getGraphGroups: async (token?: string) => {
    const params = token ? { token } : {};
    const response = await axiosInstance.get('/auth/graph/groups', { params });
    return response.data;
  },
};

/**
 * Exemple d'utilisation d'autres services API
 * Vous pouvez ajouter d'autres services ici selon vos besoins
 */
export const exampleApi = {
  // Exemple de service
  // getData: async () => {
  //   const response = await axiosInstance.get('/api/data');
  //   return response.data;
  // },
};

