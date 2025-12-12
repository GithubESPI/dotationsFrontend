'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children
}: { 
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si on a un token dans le localStorage
      if (authService.isAuthenticated()) {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          // Rafraîchir le profil depuis le serveur
          try {
            const profile = await authService.getProfile();
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } catch (error) {
            console.error('Erreur lors du rafraîchissement du profil:', error);
            // Garder l'utilisateur stocké si le rafraîchissement échoue
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Rediriger vers l'endpoint d'authentification du backend
    // Le backend gère toute la logique OAuth2 avec Azure AD
    authService.redirectToLogin();
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
