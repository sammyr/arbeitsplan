import { create } from 'zustand';
import { Store } from '@/types/store';

interface StoreState {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  setStores: (stores: Store[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  stores: [],
  selectedStore: null,
  setSelectedStore: (store) => {
    console.log('Setting selected store:', store);
    set({ selectedStore: store });
  },
  setStores: (stores) => {
    console.log('Setting stores:', stores);
    set({ stores });
  },
}));
