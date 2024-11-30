'use client';

import { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Store } from '@/types/store';
import { storage } from '@/lib/storage';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [newStore, setNewStore] = useState<string>('');
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    const storesList = storage.getStores();
    console.log('Loaded stores:', storesList);
    setStores(storesList);

    // Wenn keine Stores existieren, füge einen Beispiel-Store hinzu
    if (storesList.length === 0) {
      const exampleStore: Store = {
        id: '1',
        name: 'Hauptfiliale',
        address: 'Hauptstraße 1, 12345 Stadt',
        phone: '',
        email: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storage.saveStore(exampleStore);
      setStores([exampleStore]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim()) return;

    if (editingStore) {
      const updatedStore = { 
        ...editingStore, 
        name: newStore.trim(),
        updatedAt: new Date().toISOString()
      };
      storage.saveStore(updatedStore);
      setEditingStore(null);
    } else {
      const store: Store = {
        id: crypto.randomUUID(),
        name: newStore.trim(),
        address: '',
        phone: '',
        email: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storage.saveStore(store);
    }

    setNewStore('');
    loadStores();
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setNewStore(store.name);
  };

  const handleDelete = (storeId: string) => {
    storage.deleteStore(storeId);
    loadStores();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Filialen verwalten</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newStore}
            onChange={(e) => setNewStore(e.target.value)}
            placeholder="Neue Filiale hinzufügen"
            className="flex-grow p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {editingStore ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
          {editingStore && (
            <button
              type="button"
              onClick={() => {
                setEditingStore(null);
                setNewStore('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {stores.map((store) => (
          <li
            key={store.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <span>{store.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(store)}
                className="p-2 text-blue-500 hover:text-blue-600"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(store.id)}
                className="p-2 text-red-500 hover:text-red-600"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
