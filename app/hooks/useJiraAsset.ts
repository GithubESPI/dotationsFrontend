import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jiraAssetApi } from '../api/jira-asset';
import {
  JiraAssetObject,
  SearchJiraAssetsParams,
  SyncLaptopsParams,
  SyncResponse,
} from '../types/jira-asset';
import { useJiraAssetStore } from '../stores/jiraAssetStore';

/**
 * Hook pour obtenir l'ID du workspace Jira Asset
 */
export const useJiraWorkspaceId = () => {
  return useQuery({
    queryKey: ['jira-asset', 'workspace'],
    queryFn: () => jiraAssetApi.getWorkspaceId(),
    staleTime: 1000 * 60 * 60, // 1 heure (le workspace ID ne change pas souvent)
    retry: 1,
  });
};

/**
 * Hook pour récupérer tous les objets d'un schéma
 */
export const useJiraSchemaAssets = (schemaName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['jira-asset', 'schema', schemaName],
    queryFn: () => jiraAssetApi.getSchemaAssets(schemaName),
    enabled: enabled && !!schemaName,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook pour récupérer tous les objets d'un type d'objet spécifique
 */
export const useJiraObjectTypeAssets = (
  schemaName: string,
  objectTypeName: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['jira-asset', 'schema', schemaName, 'object-type', objectTypeName],
    queryFn: () => jiraAssetApi.getObjectTypeAssets(schemaName, objectTypeName),
    enabled: enabled && !!schemaName && !!objectTypeName,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook pour rechercher des assets dans Jira
 */
export const useSearchJiraAssets = (params: SearchJiraAssetsParams, enabled: boolean = true) => {
  const { setSearchResults, setLoading, setError } = useJiraAssetStore();

  return useQuery({
    queryKey: ['jira-asset', 'search', params],
    queryFn: () => jiraAssetApi.searchAssets(params),
    enabled: enabled && !!params.objectTypeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
    onSuccess: (data) => {
      setSearchResults(data);
      setLoading(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Erreur lors de la recherche');
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

/**
 * Hook pour récupérer un asset spécifique
 */
export const useJiraAsset = (assetId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['jira-asset', 'asset', assetId],
    queryFn: () => jiraAssetApi.getAsset(assetId!),
    enabled: enabled && !!assetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook pour synchroniser automatiquement les Laptops depuis Jira
 */
export const useSyncLaptops = () => {
  const queryClient = useQueryClient();
  const { setAttributeMapping, setError } = useJiraAssetStore();

  return useMutation({
    mutationFn: (params?: SyncLaptopsParams) => jiraAssetApi.syncLaptops(params),
    onSuccess: (data) => {
      // Mettre à jour le mapping d'attributs si détecté
      if (data.attributeMapping) {
        setAttributeMapping(data.attributeMapping);
      }
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['jira-asset'] });
      
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Erreur lors de la synchronisation');
    },
  });
};

/**
 * Hook pour synchroniser tous les équipements d'un schéma
 */
export const useSyncSchema = () => {
  const queryClient = useQueryClient();
  const { setError } = useJiraAssetStore();

  return useMutation({
    mutationFn: ({
      schemaName,
      attributeMapping,
    }: {
      schemaName: string;
      attributeMapping: {
        serialNumberAttrId: string;
        brandAttrId: string;
        modelAttrId: string;
        typeAttrId: string;
        statusAttrId?: string;
        internalIdAttrId?: string;
        assignedUserAttrId?: string;
      };
    }) => jiraAssetApi.syncSchema(schemaName, attributeMapping),
    onSuccess: () => {
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['jira-asset'] });
      
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Erreur lors de la synchronisation');
    },
  });
};

/**
 * Hook pour obtenir les équipements depuis Jira avec recherche dynamique
 * Utilise le store Zustand pour gérer l'état de recherche
 */
export const useJiraAssetsForForm = () => {
  const {
    searchQuery,
    selectedSchema,
    selectedObjectType,
    selectedObjectTypeId,
    setSearchResults,
    setLoading,
    setError,
  } = useJiraAssetStore();

  // Récupérer les assets par type d'objet si un type est sélectionné
  const objectTypeQuery = useJiraObjectTypeAssets(
    selectedSchema,
    selectedObjectType,
    !!selectedSchema && !!selectedObjectType
  );

  // Rechercher des assets si un objectTypeId est fourni et qu'une requête de recherche existe
  const searchQueryResult = useSearchJiraAssets(
    {
      objectTypeId: selectedObjectTypeId || '',
      query: searchQuery || undefined,
      limit: 100,
    },
    !!selectedObjectTypeId && searchQuery.length > 0
  );

  // Déterminer quelle source de données utiliser
  const data = searchQuery.length > 0 && selectedObjectTypeId
    ? searchQueryResult.data || []
    : objectTypeQuery.data?.assets || [];

  const isLoading = searchQuery.length > 0 && selectedObjectTypeId
    ? searchQueryResult.isLoading
    : objectTypeQuery.isLoading;

  const error = searchQuery.length > 0 && selectedObjectTypeId
    ? searchQueryResult.error
    : objectTypeQuery.error;

  // Mettre à jour le store
  React.useEffect(() => {
    if (data) {
      setSearchResults(data);
    }
  }, [data, setSearchResults]);

  React.useEffect(() => {
    setLoading(isLoading || false);
  }, [isLoading, setLoading]);

  React.useEffect(() => {
    if (error) {
      setError((error as Error).message || 'Erreur lors du chargement');
    } else {
      setError(null);
    }
  }, [error, setError]);

  return {
    assets: data,
    isLoading,
    error,
    refetch: searchQuery.length > 0 && selectedObjectTypeId
      ? searchQueryResult.refetch
      : objectTypeQuery.refetch,
  };
};

