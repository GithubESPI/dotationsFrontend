import { create } from 'zustand';
import { JiraAssetObject, AttributeMapping } from '../types/jira-asset';

interface JiraAssetState {
  // État de recherche
  searchQuery: string;
  selectedSchema: string;
  selectedObjectType: string;
  selectedObjectTypeId: string | null;
  
  // Résultats de recherche
  searchResults: JiraAssetObject[];
  isLoading: boolean;
  error: string | null;
  
  // Mapping d'attributs détecté
  attributeMapping: AttributeMapping | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedSchema: (schema: string) => void;
  setSelectedObjectType: (objectType: string) => void;
  setSelectedObjectTypeId: (objectTypeId: string | null) => void;
  setSearchResults: (results: JiraAssetObject[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAttributeMapping: (mapping: AttributeMapping | null) => void;
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  selectedSchema: 'Parc Informatique',
  selectedObjectType: 'Laptop',
  selectedObjectTypeId: null,
  searchResults: [],
  isLoading: false,
  error: null,
  attributeMapping: null,
};

export const useJiraAssetStore = create<JiraAssetState>((set) => ({
  ...initialState,

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  setSelectedSchema: (schema: string) => set({ selectedSchema: schema }),
  
  setSelectedObjectType: (objectType: string) => set({ selectedObjectType: objectType }),
  
  setSelectedObjectTypeId: (objectTypeId: string | null) => set({ selectedObjectTypeId: objectTypeId }),
  
  setSearchResults: (results: JiraAssetObject[]) => set({ searchResults: results }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error }),
  
  setAttributeMapping: (mapping: AttributeMapping | null) => set({ attributeMapping: mapping }),
  
  reset: () => set(initialState),
}));

