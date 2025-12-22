import axiosInstance from './axiosInstance';
import {
  JiraAssetObject,
  JiraWorkspaceResponse,
  JiraSchemaResponse,
  JiraObjectTypeResponse,
  SearchJiraAssetsParams,
  SyncLaptopsParams,
  SyncResponse,
} from '../types/jira-asset';

/**
 * Service API pour Jira Asset
 */
export const jiraAssetApi = {
  /**
   * Obtenir l'ID du workspace Jira Asset
   */
  getWorkspaceId: async (): Promise<string> => {
    const response = await axiosInstance.get<JiraWorkspaceResponse>('/jira-asset/workspace');
    return response.data.workspaceId;
  },

  /**
   * Récupérer tous les objets d'un schéma
   */
  getSchemaAssets: async (schemaName: string): Promise<JiraSchemaResponse> => {
    const response = await axiosInstance.get<JiraSchemaResponse>(
      `/jira-asset/schema/${encodeURIComponent(schemaName)}`
    );
    return response.data;
  },

  /**
   * Récupérer tous les objets d'un type d'objet spécifique dans un schéma
   */
  getObjectTypeAssets: async (
    schemaName: string,
    objectTypeName: string
  ): Promise<JiraObjectTypeResponse> => {
    const response = await axiosInstance.get<JiraObjectTypeResponse>(
      `/jira-asset/schema/${encodeURIComponent(schemaName)}/object-type/${encodeURIComponent(objectTypeName)}`
    );
    return response.data;
  },

  /**
   * Rechercher des assets dans Jira
   */
  searchAssets: async (params: SearchJiraAssetsParams): Promise<JiraAssetObject[]> => {
    const response = await axiosInstance.post<{ values: JiraAssetObject[] }>(
      '/jira-asset/search',
      params
    );
    return response.data.values || [];
  },

  /**
   * Récupérer un asset spécifique par son ID
   */
  getAsset: async (assetId: string): Promise<JiraAssetObject> => {
    const response = await axiosInstance.get<JiraAssetObject>(`/jira-asset/asset/${assetId}`);
    return response.data;
  },

  /**
   * Synchroniser automatiquement tous les Laptops depuis Jira
   */
  syncLaptops: async (params?: SyncLaptopsParams): Promise<SyncResponse> => {
    const response = await axiosInstance.post<SyncResponse>('/jira-asset/sync/laptops', params || {});
    return response.data;
  },

  /**
   * Synchroniser tous les équipements d'un schéma depuis Jira
   */
  syncSchema: async (
    schemaName: string,
    attributeMapping: {
      serialNumberAttrId: string;
      brandAttrId: string;
      modelAttrId: string;
      typeAttrId: string;
      statusAttrId?: string;
      internalIdAttrId?: string;
      assignedUserAttrId?: string;
    }
  ): Promise<SyncResponse> => {
    const response = await axiosInstance.post<SyncResponse>(
      `/jira-asset/sync/schema/${encodeURIComponent(schemaName)}`,
      attributeMapping
    );
    return response.data;
  },
};

