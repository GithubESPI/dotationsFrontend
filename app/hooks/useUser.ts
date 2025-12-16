import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/services';
import { User } from '../services/auth.service';

export const useUser = () => {
  return useQuery<User>({
    queryKey: ['user', 'profile'],
    queryFn: () => authApi.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserGroups = () => {
  return useQuery({
    queryKey: ['user', 'groups'],
    queryFn: () => {
      // Le token Azure AD sera automatiquement récupéré depuis localStorage dans authApi.getGraphGroups
      return authApi.getGraphGroups();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('azure_access_token'), // Activer seulement si le token Azure AD est disponible
    retry: false, // Ne pas réessayer si le token n'est pas disponible
  });
};

export const useUserPhoto = () => {
  return useQuery({
    queryKey: ['user', 'photo'],
    queryFn: () => {
      // Le token Azure AD sera automatiquement récupéré depuis localStorage dans authApi.getGraphPhoto
      return authApi.getGraphPhoto();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes (les photos changent rarement)
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('azure_access_token'), // Activer seulement si le token Azure AD est disponible
    retry: false, // Ne pas réessayer si le token n'est pas disponible
  });
};

