'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Store } from '@/types/store';
import { dbService } from '@/lib/db';

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  addStore: (store: Omit<Store, 'id'>) => Promise<void>;
  updateStore: (id: string, store: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    try {
      const storesData = await dbService.getStores();
      setStores(storesData);
      setError(null);
    } catch (err) {
      setError('Failed to load stores');
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addStore(store: Omit<Store, 'id'>) {
    try {
      const id = await dbService.addStore(store);
      const newStore = await dbService.getStore(id);
      if (newStore) {
        setStores(prev => [...prev, newStore]);
      }
    } catch (err) {
      setError('Failed to add store');
      console.error('Error adding store:', err);
    }
  }

  async function updateStore(id: string, store: Partial<Store>) {
    try {
      await dbService.updateStore(id, store);
      const updatedStore = await dbService.getStore(id);
      if (updatedStore) {
        setStores(prev => prev.map(s => s.id === id ? updatedStore : s));
        if (selectedStore?.id === id) {
          setSelectedStore(updatedStore);
        }
      }
    } catch (err) {
      setError('Failed to update store');
      console.error('Error updating store:', err);
    }
  }

  async function deleteStore(id: string) {
    try {
      await dbService.deleteStore(id);
      setStores(prev => prev.filter(store => store.id !== id));
      if (selectedStore?.id === id) {
        setSelectedStore(null);
      }
    } catch (err) {
      setError('Failed to delete store');
      console.error('Error deleting store:', err);
    }
  }

  const value = {
    stores,
    selectedStore,
    setSelectedStore,
    addStore,
    updateStore,
    deleteStore,
    loading,
    error
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
