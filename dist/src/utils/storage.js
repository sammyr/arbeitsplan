"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const STORAGE_KEYS = {
    EMPLOYEES: 'workplan_employees',
    SHIFTS: 'workplan_shifts',
    WORKPLAN: 'workplan_entries',
    STORES: 'stores',
};
exports.storage = {
    // Employees
    getEmployees: () => {
        if (typeof window === 'undefined')
            return [];
        const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
        return data ? JSON.parse(data) : [];
    },
    saveEmployee: (employee) => {
        const employees = exports.storage.getEmployees();
        const updatedEmployees = [...employees, Object.assign(Object.assign({}, employee), { id: crypto.randomUUID() })];
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
    },
    updateEmployee: (employee) => {
        const employees = exports.storage.getEmployees();
        const updatedEmployees = employees.map(emp => emp.id === employee.id ? employee : emp);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
    },
    deleteEmployee: (id) => {
        const employees = exports.storage.getEmployees();
        const updatedEmployees = employees.filter(emp => emp.id !== id);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
    },
    // Working Shifts
    getShifts: () => {
        if (typeof window === 'undefined')
            return [];
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
            if (!data)
                return [];
            const shifts = JSON.parse(data);
            if (!Array.isArray(shifts))
                return [];
            return shifts.map(shift => {
                var _a, _b;
                return (Object.assign(Object.assign({}, shift), { id: shift.id.toString(), storeId: (_b = (_a = shift.storeId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '', startTime: shift.startTime || shift.fromTime || '09:00', endTime: shift.endTime || shift.toTime || '17:00' }));
            });
        }
        catch (error) {
            console.error('Error loading shifts:', error);
            return [];
        }
    },
    saveShift: (shift) => {
        var _a, _b;
        try {
            const shifts = exports.storage.getShifts();
            const newShift = Object.assign(Object.assign({}, shift), { id: crypto.randomUUID(), storeId: (_b = (_a = shift.storeId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '' });
            const updatedShifts = [...shifts, newShift];
            localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updatedShifts));
            return newShift;
        }
        catch (error) {
            console.error('Error saving shift:', error);
            throw new Error('Fehler beim Speichern der Schicht');
        }
    },
    updateShift: (shift) => {
        try {
            const shifts = exports.storage.getShifts();
            const updatedShifts = shifts.map(s => s.id === shift.id ? Object.assign(Object.assign({}, shift), { id: shift.id.toString() }) : s);
            localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updatedShifts));
        }
        catch (error) {
            console.error('Error updating shift:', error);
            throw new Error('Fehler beim Aktualisieren der Schicht');
        }
    },
    deleteShift: (id) => {
        try {
            const shifts = exports.storage.getShifts();
            const updatedShifts = shifts.filter(s => s.id !== id);
            localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updatedShifts));
        }
        catch (error) {
            console.error('Error deleting shift:', error);
            throw new Error('Fehler beim Löschen der Schicht');
        }
    },
    // Workplan Entries
    getWorkplanEntries: () => {
        if (typeof window === 'undefined')
            return [];
        const data = localStorage.getItem(STORAGE_KEYS.WORKPLAN);
        return data ? JSON.parse(data) : [];
    },
    saveWorkplanEntry: (entry) => {
        const entries = exports.storage.getWorkplanEntries();
        const updatedEntries = [...entries, Object.assign(Object.assign({}, entry), { id: crypto.randomUUID() })];
        localStorage.setItem(STORAGE_KEYS.WORKPLAN, JSON.stringify(updatedEntries));
    },
    updateWorkplanEntry: (entry) => {
        const entries = exports.storage.getWorkplanEntries();
        const updatedEntries = entries.map(e => e.id === entry.id ? entry : e);
        localStorage.setItem(STORAGE_KEYS.WORKPLAN, JSON.stringify(updatedEntries));
    },
    deleteWorkplanEntry: (id) => {
        const entries = exports.storage.getWorkplanEntries();
        const updatedEntries = entries.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.WORKPLAN, JSON.stringify(updatedEntries));
    },
    // Stores
    getStores: () => {
        const stores = localStorage.getItem(STORAGE_KEYS.STORES);
        return stores ? JSON.parse(stores) : [];
    },
    saveStore: (store) => {
        const stores = exports.storage.getStores();
        stores.push(store);
        localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    },
    updateStore: (store) => {
        const stores = exports.storage.getStores();
        const index = stores.findIndex((s) => s.id === store.id);
        if (index !== -1) {
            stores[index] = store;
            localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
        }
    },
    deleteStore: (id) => {
        const stores = exports.storage.getStores();
        const filteredStores = stores.filter((store) => store.id !== id);
        localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(filteredStores));
    },
};
