import { WorkingShift } from '@/types';
import { Store } from '@/types/store';
import { Employee } from '@/types/employee';
import { ShiftAssignment } from '@/types/shift-assignment';
import { dbService } from '@/lib/db';

class StorageService {
  private readonly SHIFTS_KEY = 'arbeitsplan_shifts';
  private readonly STORES_KEY = 'arbeitsplan_stores';
  private readonly EMPLOYEES_KEY = 'arbeitsplan_employees';
  private readonly ASSIGNMENTS_KEY = 'arbeitsplan_assignments';

  // Store Management
  getStores(): Store[] {
    if (typeof window === 'undefined') return [];
    
    const storesJson = localStorage.getItem(this.STORES_KEY);
    if (!storesJson) return [];

    try {
      const stores = JSON.parse(storesJson);
      console.log('Retrieved stores from storage:', stores);
      return stores;
    } catch (error) {
      console.error('Error parsing stores from storage:', error);
      return [];
    }
  }

  saveStore(store: Store): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stores = this.getStores();
      const index = stores.findIndex(s => s.id === store.id);
      
      if (index !== -1) {
        stores[index] = store;
      } else {
        stores.push(store);
      }
      
      console.log('Saving stores to storage:', stores);
      localStorage.setItem(this.STORES_KEY, JSON.stringify(stores));
    } catch (error) {
      console.error('Error saving store to storage:', error);
    }
  }

  deleteStore(storeId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stores = this.getStores();
      const filteredStores = stores.filter(s => s.id !== storeId);
      localStorage.setItem(this.STORES_KEY, JSON.stringify(filteredStores));
    } catch (error) {
      console.error('Error deleting store from storage:', error);
    }
  }

  // Employee Management
  async getEmployees(): Promise<Employee[]> {
    try {
      const employees = await dbService.getEmployees();
      console.log('Retrieved employees from DB:', employees);
      return employees;
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  }

  saveEmployee(employee: Employee): void {
    if (typeof window === 'undefined') return;
    
    try {
      const employees = this.getEmployeesSync();
      const index = employees.findIndex(e => e.id === employee.id);
      
      if (index !== -1) {
        employees[index] = employee;
      } else {
        employees.push(employee);
      }
      
      console.log('Saving employees to storage:', employees);
      localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving employee to storage:', error);
    }
  }

  deleteEmployee(employeeId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const employees = this.getEmployeesSync();
      const filteredEmployees = employees.filter(e => e.id !== employeeId);
      localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(filteredEmployees));
    } catch (error) {
      console.error('Error deleting employee from storage:', error);
    }
  }

  private getEmployeesSync(): Employee[] {
    if (typeof window === 'undefined') return [];
    
    const employeesJson = localStorage.getItem(this.EMPLOYEES_KEY);
    if (!employeesJson) return [];

    try {
      return JSON.parse(employeesJson);
    } catch (error) {
      console.error('Error parsing employees from storage:', error);
      return [];
    }
  }

  // Assignment Management
  async getAssignments(): Promise<ShiftAssignment[]> {
    try {
      const assignments = await dbService.getAssignments();
      console.log('Retrieved assignments from DB:', assignments);
      return assignments;
    } catch (error) {
      console.error('Error getting assignments:', error);
      return [];
    }
  }

  saveAssignments(assignments: any[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      console.log('Saving assignments to storage:', assignments);
      localStorage.setItem(this.ASSIGNMENTS_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving assignments to storage:', error);
    }
  }

  // Shifts Management
  async getShifts(): Promise<WorkingShift[]> {
    try {
      const shifts = await dbService.getShifts();
      console.log('Retrieved shifts from DB:', shifts);
      return shifts;
    } catch (error) {
      console.error('Error getting shifts:', error);
      return [];
    }
  }

  saveShifts(shifts: WorkingShift[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.SHIFTS_KEY, JSON.stringify(shifts));
    } catch (error) {
      console.error('Error saving shifts to storage:', error);
    }
  }

  addShift(shift: WorkingShift): void {
    const shifts = this.getShiftsSync();
    shifts.push(shift);
    this.saveShifts(shifts);
  }

  updateShift(updatedShift: WorkingShift): void {
    const shifts = this.getShiftsSync();
    const index = shifts.findIndex(s => s.id === updatedShift.id);
    if (index !== -1) {
      shifts[index] = updatedShift;
      this.saveShifts(shifts);
    }
  }

  deleteShift(shiftId: string): void {
    const shifts = this.getShiftsSync();
    const filteredShifts = shifts.filter(s => s.id !== shiftId);
    this.saveShifts(filteredShifts);
  }

  clearShifts(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SHIFTS_KEY);
  }

  private getShiftsSync(): WorkingShift[] {
    if (typeof window === 'undefined') return [];
    
    const shiftsJson = localStorage.getItem(this.SHIFTS_KEY);
    if (!shiftsJson) return [];

    try {
      return JSON.parse(shiftsJson);
    } catch (error) {
      console.error('Error parsing shifts from storage:', error);
      return [];
    }
  }
}

export const storage = new StorageService();
