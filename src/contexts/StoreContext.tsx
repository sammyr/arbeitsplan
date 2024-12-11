'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Store } from '@/types/store';
import { dbService } from '@/lib/db';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStores();
    } else {
      setStores([]);
    }
  }, [user]);

  async function loadStores() {
    if (!user) return;
    
    try {
      const storesData = await dbService.getStores(user.uid);
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
      if (!user) {
        throw new Error('Sie müssen angemeldet sein');
      }
      const newStore = await dbService.addStore({ ...store, organizationId: user.uid });
      setStores(prev => [...prev, newStore]);
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
      console.log('StoreContext: Deleting store:', id);
      await dbService.deleteStore(id);
      
      // Immediately update the local state
      console.log('StoreContext: Updating local state...');
      setStores(prev => {
        const newStores = prev.filter(store => store.id !== id);
        console.log('StoreContext: New stores state:', newStores);
        return newStores;
      });
      
      // Clear selected store if it was deleted
      if (selectedStore?.id === id) {
        console.log('StoreContext: Clearing selected store');
        setSelectedStore(null);
      }
      
      console.log('StoreContext: Store deletion complete');
    } catch (err) {
      console.error('StoreContext: Error deleting store:', err);
      setError('Failed to delete store');
      throw err;
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
