import { create } from 'zustand';
import { SearchEquipmentParams } from '../types/equipment';

interface EquipmentSearchState {
  searchParams: SearchEquipmentParams;
  setSearchQuery: (query: string) => void;
  setType: (type: string) => void;
  setStatus: (status: string) => void;
  setBrand: (brand: string) => void;
  setLocation: (location: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

const initialState: SearchEquipmentParams = {
  page: 1,
  limit: 20,
};

export const useEquipmentSearchStore = create<EquipmentSearchState>((set) => ({
  searchParams: initialState,

  setSearchQuery: (query: string) =>
    set((state) => ({
      searchParams: { ...state.searchParams, query: query || undefined, page: 1 },
    })),

  setType: (type: string) =>
    set((state) => ({
      searchParams: { ...state.searchParams, type: type as any || undefined, page: 1 },
    })),

  setStatus: (status: string) =>
    set((state) => ({
      searchParams: { ...state.searchParams, status: status as any || undefined, page: 1 },
    })),

  setBrand: (brand: string) =>
    set((state) => ({
      searchParams: { ...state.searchParams, brand: brand || undefined, page: 1 },
    })),

  setLocation: (location: string) =>
    set((state) => ({
      searchParams: { ...state.searchParams, location: location || undefined, page: 1 },
    })),

  setPage: (page: number) =>
    set((state) => ({
      searchParams: { ...state.searchParams, page },
    })),

  setLimit: (limit: number) =>
    set((state) => ({
      searchParams: { ...state.searchParams, limit, page: 1 },
    })),

  reset: () => set({ searchParams: initialState }),
}));

