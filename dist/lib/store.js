import { create } from 'zustand';
export const useStore = create((set) => ({
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
