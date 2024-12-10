"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProvider = StoreProvider;
exports.useStore = useStore;
const react_1 = __importStar(require("react"));
const db_1 = require("@/lib/db");
const StoreContext = (0, react_1.createContext)(undefined);
function StoreProvider({ children }) {
    const [stores, setStores] = (0, react_1.useState)([]);
    const [selectedStore, setSelectedStore] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadStores();
    }, []);
    async function loadStores() {
        try {
            const storesData = await db_1.dbService.getStores();
            setStores(storesData);
            setError(null);
        }
        catch (err) {
            setError('Failed to load stores');
            console.error('Error loading stores:', err);
        }
        finally {
            setLoading(false);
        }
    }
    async function addStore(store) {
        try {
            const id = await db_1.dbService.addStore(store);
            const newStore = await db_1.dbService.getStore(id);
            if (newStore) {
                setStores(prev => [...prev, newStore]);
            }
        }
        catch (err) {
            setError('Failed to add store');
            console.error('Error adding store:', err);
        }
    }
    async function updateStore(id, store) {
        try {
            await db_1.dbService.updateStore(id, store);
            const updatedStore = await db_1.dbService.getStore(id);
            if (updatedStore) {
                setStores(prev => prev.map(s => s.id === id ? updatedStore : s));
                if ((selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id) === id) {
                    setSelectedStore(updatedStore);
                }
            }
        }
        catch (err) {
            setError('Failed to update store');
            console.error('Error updating store:', err);
        }
    }
    async function deleteStore(id) {
        try {
            await db_1.dbService.deleteStore(id);
            setStores(prev => prev.filter(store => store.id !== id));
            if ((selectedStore === null || selectedStore === void 0 ? void 0 : selectedStore.id) === id) {
                setSelectedStore(null);
            }
        }
        catch (err) {
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
    return (<StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>);
}
function useStore() {
    const context = (0, react_1.useContext)(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
