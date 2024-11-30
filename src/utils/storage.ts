'use client';

import { Employee } from '@/types/employee';
import { WorkingShift, WorkplanEntry } from '@/types';
import { Store } from '@/types/store';

const STORAGE_KEYS = {
  EMPLOYEES: 'workplan_employees',
  SHIFTS: 'workplan_shifts',
  WORKPLAN: 'workplan_entries',
  STORES: 'stores',
};

export const storage = {
  // Employees
  getEmployees: (): Employee[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  },

  saveEmployee: (employee: Employee) => {
    const employees = storage.getEmployees();
    const updatedEmployees = [...employees, { ...employee, id: crypto.randomUUID() }];
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
  },

  updateEmployee: (employee: Employee) => {
    const employees = storage.getEmployees();
    const updatedEmployees = employees.map(emp => 
      emp.id === employee.id ? employee : emp
    );
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
  },

  deleteEmployee: (id: string) => {
    const employees = storage.getEmployees();
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
  },

  // Working Shifts
  getShifts: (): WorkingShift[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      if (!data) return [];
      
      const shifts = JSON.parse(data);
      if (!Array.isArray(shifts)) return [];
      
      return shifts.map(shift => ({
        ...shift,
        id: shift.id.toString(),
        storeId: shift.storeId?.toString() ?? '',
        startTime: shift.startTime || shift.fromTime || '09:00',
        endTime: shift.endTime || shift.toTime || '17:00'
      }));
    } catch (error) {
      console.error('Error loading shifts:', error);
      return [];
    }
  },

  saveShift: (shift: Omit<WorkingShift, 'id'>) => {
    try {
      const shifts = storage.getShifts();
      const newShift: WorkingShift = {
        ...shift,
        id: crypto.randomUUID(),
        storeId: shift.storeId?.toString() ?? '',
      };
      const updatedShifts = [...shifts, newShift];
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updatedShifts));
      return newShift;
    } catch (error) {
      console.error('Error saving shift:', error);
      throw new Error('Fehler beim Speichern der Schicht');
    }
  },

  updateShift: (shift: WorkingShift) => {
    try {
      const shifts = storage.getShifts();
      const updatedShifts = shifts.map(s => 
        s.id === shift.id ? { ...shift, id: shift.id.toString() } : s
      );
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updatedShifts));
    } catch (error) {
      console.error('Error updating shift:', error);
      throw new Error('Fehler beim Aktualisieren der Schicht');
    }
  },

  deleteShift: (id: string) => {
    try {
      const shifts = storage.getShifts();
      const updatedShifts = shifts.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updatedShifts));
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw new Error('Fehler beim Löschen der Schicht');
    }
  },

  // Workplan Entries
  getWorkplanEntries: (): WorkplanEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.WORKPLAN);
    return data ? JSON.parse(data) : [];
  },

  saveWorkplanEntry: (entry: WorkplanEntry) => {
    const entries = storage.getWorkplanEntries();
    const updatedEntries = [...entries, { ...entry, id: crypto.randomUUID() }];
    localStorage.setItem(STORAGE_KEYS.WORKPLAN, JSON.stringify(updatedEntries));
  },

  updateWorkplanEntry: (entry: WorkplanEntry) => {
    const entries = storage.getWorkplanEntries();
    const updatedEntries = entries.map(e => 
      e.id === entry.id ? entry : e
    );
    localStorage.setItem(STORAGE_KEYS.WORKPLAN, JSON.stringify(updatedEntries));
  },

  deleteWorkplanEntry: (id: string) => {
    const entries = storage.getWorkplanEntries();
    const updatedEntries = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKPLAN, JSON.stringify(updatedEntries));
  },

  // Stores
  getStores: (): Store[] => {
    const stores = localStorage.getItem(STORAGE_KEYS.STORES);
    return stores ? JSON.parse(stores) : [];
  },

  saveStore: (store: Store): void => {
    const stores = storage.getStores();
    stores.push(store);
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  },

  updateStore: (store: Store): void => {
    const stores = storage.getStores();
    const index = stores.findIndex((s) => s.id === store.id);
    if (index !== -1) {
      stores[index] = store;
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    }
  },

  deleteStore: (id: string): void => {
    const stores = storage.getStores();
    const filteredStores = stores.filter((store) => store.id !== id);
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(filteredStores));
  },
};
