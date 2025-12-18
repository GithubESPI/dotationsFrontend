import { create } from 'zustand';
import { EquipmentItem } from '../types/allocation';
import { Employee } from '../types/employee';

interface AllocationFormState {
  // Employé sélectionné
  selectedEmployee: Employee | null;
  
  // Liste des équipements à affecter
  equipments: EquipmentItem[];
  
  // Champs additionnels
  deliveryDate: string;
  accessories: string[];
  additionalSoftware: string[];
  services: string[];
  notes: string;
  
  // État du formulaire
  isOpen: boolean;
  
  // Actions
  setSelectedEmployee: (employee: Employee | null) => void;
  addEquipment: (equipment: EquipmentItem) => void;
  removeEquipment: (index: number) => void;
  updateEquipment: (index: number, equipment: Partial<EquipmentItem>) => void;
  setDeliveryDate: (date: string) => void;
  setAccessories: (accessories: string[]) => void;
  setAdditionalSoftware: (software: string[]) => void;
  setServices: (services: string[]) => void;
  setNotes: (notes: string) => void;
  openModal: (employee: Employee) => void;
  closeModal: () => void;
  resetForm: () => void;
}

const initialEquipment: EquipmentItem = {
  equipmentId: '',
  internalId: '',
  type: '',
  serialNumber: '',
  deliveredDate: new Date().toISOString().split('T')[0],
  condition: 'bon_etat',
};

const initialState = {
  selectedEmployee: null,
  equipments: [],
  deliveryDate: new Date().toISOString().split('T')[0],
  accessories: [],
  additionalSoftware: [],
  services: [],
  notes: '',
  isOpen: false,
};

export const useAllocationFormStore = create<AllocationFormState>((set) => ({
  ...initialState,

  setSelectedEmployee: (employee) =>
    set({ selectedEmployee: employee }),

  addEquipment: (equipment) =>
    set((state) => ({
      equipments: [...state.equipments, equipment],
    })),

  removeEquipment: (index) =>
    set((state) => ({
      equipments: state.equipments.filter((_, i) => i !== index),
    })),

  updateEquipment: (index, updates) =>
    set((state) => ({
      equipments: state.equipments.map((eq, i) =>
        i === index ? { ...eq, ...updates } : eq
      ),
    })),

  setDeliveryDate: (date) => set({ deliveryDate: date }),
  setAccessories: (accessories) => set({ accessories }),
  setAdditionalSoftware: (software) => set({ additionalSoftware: software }),
  setServices: (services) => set({ services }),
  setNotes: (notes) => set({ notes }),

  openModal: (employee) =>
    set({
      isOpen: true,
      selectedEmployee: employee,
      equipments: [initialEquipment],
      deliveryDate: new Date().toISOString().split('T')[0],
      accessories: [],
      additionalSoftware: [],
      services: [],
      notes: '',
    }),

  closeModal: () =>
    set({
      isOpen: false,
      selectedEmployee: null,
      equipments: [],
      deliveryDate: new Date().toISOString().split('T')[0],
      accessories: [],
      additionalSoftware: [],
      services: [],
      notes: '',
    }),

  resetForm: () => set(initialState),
}));

