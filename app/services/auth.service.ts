import axiosInstance from '../api/axiosInstance';

export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  graphData?: any;
}

export interface AuthResponse {
  access_token: string;
  azure_access_token?: string;
  user: User;
}

class AuthService {
  /**
   * Rediriger vers l'endpoint d'authentification du backend
   * Le backend gère toute la logique OAuth2 avec Azure AD
   */
  redirectToLogin(): void {
    if (typeof window === 'undefined') return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/azure-ad`;
  }

  /**
   * Extraire le token depuis l'URL après redirection depuis le backend
   * Le backend callback redirige vers le frontend avec le token
   */
  async handleCallback(token?: string): Promise<AuthResponse | null> {
    if (!token) {
      // Essayer de récupérer depuis l'URL
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token') || undefined;
      }
    }

    if (!token) {
      return null;
    }

    try {
      // Stocker le token
      localStorage.setItem('access_token', token);
      
      // Récupérer le profil utilisateur
      const profile = await this.getProfile();
      if (profile) {
        localStorage.setItem('user', JSON.stringify(profile));
      }

      return {
        access_token: token,
        user: profile,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la récupération du profil'
      );
    }
  }

  /**
   * Authentification avec un token Azure AD (pour tests)
   */
  async loginWithAzureToken(azureToken: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/test', {
        azureToken,
      });
      
      // Stocker les tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }
      if (response.data.azure_access_token) {
        localStorage.setItem('azure_access_token', response.data.azure_access_token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de l\'authentification avec Azure AD'
      );
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<User> {
    try {
      const response = await axiosInstance.get<User>('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la récupération du profil'
      );
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Ignorer les erreurs de déconnexion
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('azure_access_token');
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Récupérer le token d'accès
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Récupérer le token Azure AD
   */
  getAzureAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('azure_access_token');
  }
}

export const authService = new AuthService();

