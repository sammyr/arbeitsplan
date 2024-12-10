"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StoresPage;
const react_1 = require("react");
const storage_1 = require("@/lib/storage");
const initialData_1 = require("@/lib/initialData");
function StoresPage() {
    const [stores, setStores] = (0, react_1.useState)([]);
    const [newStore, setNewStore] = (0, react_1.useState)('');
    const [editingStore, setEditingStore] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadStores();
    }, []);
    const loadStores = () => {
        const storesList = storage_1.storage.getStores();
        console.log('Loaded stores:', storesList);
        setStores(storesList);
        // Wenn keine Stores existieren, füge die Initial-Stores hinzu
        if (storesList.length === 0) {
            initialData_1.initialStores.forEach(store => {
                storage_1.storage.saveStore(store);
            });
            setStores(initialData_1.initialStores);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newStore.trim())
            return;
        if (editingStore) {
            const updatedStore = Object.assign(Object.assign({}, editingStore), { name: newStore.trim(), updatedAt: new Date().toISOString() });
            storage_1.storage.saveStore(updatedStore);
            setEditingStore(null);
        }
        else {
            const store = {
                id: crypto.randomUUID(),
                name: newStore.trim(),
                address: '',
                phone: '',
                email: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            storage_1.storage.saveStore(store);
        }
        setNewStore('');
        loadStores();
    };
    const handleEdit = (store) => {
        setEditingStore(store);
        setNewStore(store.name);
    };
    const handleDelete = (storeId) => {
        storage_1.storage.deleteStore(storeId);
        loadStores();
    };
    return (<div className="min-h-screen bg-transparent py-4 sm:py-8">
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-slate-700">
                  Filialname
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input type="text" id="storeName" value={newStore} onChange={(e) => setNewStore(e.target.value)} placeholder="Name der Filiale" className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors duration-200 outline-none"/>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {editingStore && (<button type="button" onClick={() => {
                setEditingStore(null);
                setNewStore('');
            }} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Abbrechen
                </button>)}
              <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  {editingStore ? (<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>) : (<path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/>)}
                </svg>
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
                {stores.map((store) => (<tr key={store.id} className="hover:bg-slate-50 transition-all duration-200">
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
                        <button onClick={() => handleEdit(store)} className="p-1.5 sm:p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200" title="Bearbeiten">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(store.id)} className="p-1.5 sm:p-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors duration-200" title="Löschen">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>);
}
