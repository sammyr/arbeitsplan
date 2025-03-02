'use client';

import { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Store, GermanState, germanStates } from '@/types/store';
import { dbService } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'react-hot-toast';

export default function StoresPage() {
  const { user } = useAuth();
  const { stores, addStore, updateStore, deleteStore } = useStore();
  const [newStore, setNewStore] = useState<Partial<Store>>({
    name: '',
    street: '',
    houseNumber: '',
    zipCode: '',
    city: '',
    state: germanStates[0]
  });
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // loadStores();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.name?.trim() || !user) return;

    try {
      setIsLoading(true);
      if (editingStore) {
        await updateStore(editingStore.id, { 
          name: newStore.name.trim(),
          street: newStore.street || '',
          houseNumber: newStore.houseNumber || '',
          zipCode: newStore.zipCode || '',
          city: newStore.city || '',
          state: newStore.state || germanStates[0],
          updatedAt: new Date().toISOString()
        });
        toast.success('Filiale wurde aktualisiert');
        setEditingStore(null);
      } else {
        const store: Omit<Store, 'id'> = {
          name: newStore.name.trim(),
          street: newStore.street || '',
          houseNumber: newStore.houseNumber || '',
          zipCode: newStore.zipCode || '',
          city: newStore.city || '',
          state: newStore.state || germanStates[0],
          organizationId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addStore(store);
        toast.success('Filiale wurde erstellt');
      }

      setNewStore({
        name: '',
        street: '',
        houseNumber: '',
        zipCode: '',
        city: '',
        state: germanStates[0]
      });
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Fehler beim Speichern der Filiale');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setNewStore(store);
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
        {/* Ladeanimation entfernt, Container beibehalten */}
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
          
          <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Filiale hinzufügen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Linke Spalte */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="storeName" className="block text-base font-medium text-slate-700 mb-2">
                    Filialname
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    value={newStore.name}
                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                    placeholder="Name der Filiale"
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="storeStreet" className="block text-base font-medium text-slate-700 mb-2">
                    Straße
                  </label>
                  <input
                    type="text"
                    id="storeStreet"
                    value={newStore.street}
                    onChange={(e) => setNewStore({ ...newStore, street: e.target.value })}
                    placeholder="Straße"
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="storeHouseNumber" className="block text-base font-medium text-slate-700 mb-2">
                    Hausnummer
                  </label>
                  <input
                    type="text"
                    id="storeHouseNumber"
                    value={newStore.houseNumber}
                    onChange={(e) => setNewStore({ ...newStore, houseNumber: e.target.value })}
                    placeholder="Hausnummer"
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                    required
                  />
                </div>
              </div>

              {/* Rechte Spalte */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="storeZipCode" className="block text-base font-medium text-slate-700 mb-2">
                    PLZ
                  </label>
                  <input
                    type="text"
                    id="storeZipCode"
                    value={newStore.zipCode}
                    onChange={(e) => setNewStore({ ...newStore, zipCode: e.target.value })}
                    placeholder="PLZ"
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="storeCity" className="block text-base font-medium text-slate-700 mb-2">
                    Stadt
                  </label>
                  <input
                    type="text"
                    id="storeCity"
                    value={newStore.city}
                    onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                    placeholder="Stadt"
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="storeState" className="block text-base font-medium text-slate-700 mb-2">
                    Bundesland
                  </label>
                  <select
                    id="storeState"
                    value={newStore.state}
                    onChange={(e) => setNewStore({ ...newStore, state: e.target.value as GermanState })}
                    className="block w-full px-4 py-3 text-base rounded-lg border-slate-200 bg-slate-50 shadow-sm
                      focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300
                      transition-colors duration-200"
                    required
                  >
                    {germanStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {editingStore && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStore(null);
                    setNewStore({
                      name: '',
                      street: '',
                      houseNumber: '',
                      zipCode: '',
                      city: '',
                      state: germanStates[0]
                    });
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
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Bundesland
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
                          <div className="text-xs text-slate-600">{store.street} {store.houseNumber}, {store.zipCode} {store.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{store.state}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleEdit(store)}
                          className="p-1.5 sm:p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                          title="Bearbeiten"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="p-1.5 sm:p-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                          title="Löschen"
                        >
                          <FaTrash />
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
