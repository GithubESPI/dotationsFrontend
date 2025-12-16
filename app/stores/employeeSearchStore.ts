import { create } from 'zustand';
import { SearchEmployeeParams } from '../types/employee';

interface EmployeeSearchState {
  searchParams: SearchEmployeeParams;
  setQuery: (query: string) => void;
  setDepartment: (department: string | undefined) => void;
  setOfficeLocation: (officeLocation: string | undefined) => void;
  setIsActive: (isActive: boolean | undefined) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
}

const initialParams: SearchEmployeeParams = {
  query: undefined,
  department: undefined,
  officeLocation: undefined,
  isActive: undefined,
  page: 1,
  limit: 20,
};

export const useEmployeeSearchStore = create<EmployeeSearchState>((set) => ({
  searchParams: initialParams,
  
  setQuery: (query: string) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        query: query || undefined,
        page: 1, // Reset à la page 1 lors d'une nouvelle recherche
      },
    })),
  
  setDepartment: (department: string | undefined) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        department,
        page: 1,
      },
    })),
  
  setOfficeLocation: (officeLocation: string | undefined) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        officeLocation,
        page: 1,
      },
    })),
  
  setIsActive: (isActive: boolean | undefined) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        isActive,
        page: 1,
      },
    })),
  
  setPage: (page: number) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        page,
      },
    })),
  
  setLimit: (limit: number) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        limit,
        page: 1,
      },
    })),
  
  resetFilters: () =>
    set({
      searchParams: initialParams,
    }),
}));

