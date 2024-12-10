'use client';

import { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Store } from '@/types/store';
import { dbService } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'react-hot-toast';

export default function StoresPage() {
  const { user } = useAuth();
  const { stores, addStore, updateStore, deleteStore } = useStore();
  const [newStore, setNewStore] = useState<string>('');
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // loadStores();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim() || !user) return;

    try {
      setIsLoading(true);
      if (editingStore) {
        await updateStore(editingStore.id, { 
          name: newStore.trim(),
          updatedAt: new Date().toISOString()
        });
        toast.success('Filiale wurde aktualisiert');
        setEditingStore(null);
      } else {
        const store: Omit<Store, 'id'> = {
          name: newStore.trim(),
          address: '',
          phone: '',
          email: '',
          organizationId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addStore(store);
        toast.success('Filiale wurde erstellt');
      }

      setNewStore('');
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Fehler beim Speichern der Filiale');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setNewStore(store.name);
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm('Möchten Sie diese Filiale wirklich löschen? Alle zugehörigen Schichten und Zuweisungen werden ebenfalls gelöscht.')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteStore(storeId);
      toast.success('Filiale wurde erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Fehler beim Löschen der Filiale');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Filialen</h1>
            <p className="mt-1 sm:mt-2 text-sm text-slate-600">
              Verwalten Sie hier Ihre Filialen und deren Kontaktdaten.
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-sm bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600">
              Gesamt Filialen: {stores.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Filiale hinzufügen</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="storeName" className="block text-base font-medium text-slate-700 mb-2">
                Filialname
              </label>
              <input
                type="text"
                id="storeName"
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                placeholder="Name der Filiale"
                className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                  focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                  transition-colors duration-200"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {editingStore && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStore(null);
                    setNewStore('');
                  }}
                  className="px-6 py-2.5 text-base font-medium rounded-lg border border-slate-300 
                    text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 text-base font-medium rounded-lg border border-transparent 
                  text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                disabled={isLoading}
              >
                {editingStore ? 'Aktualisieren' : 'Hinzufügen'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Filiale
                  </th>
                  <th scope="col" className="relative px-4 sm:px-6 py-3">
                    <span className="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50 transition-all duration-200">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100/80 flex items-center justify-center">
                            <span className="text-emerald-700 font-medium text-base sm:text-lg">
                              {store.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-slate-900">{store.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleEdit(store)}
                          className="p-1.5 sm:p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                          title="Bearbeiten"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="p-1.5 sm:p-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                          title="Löschen"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
