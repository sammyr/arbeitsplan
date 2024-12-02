import { Employee } from '@/types/employee';
import { Store } from '@/types/store';
import { Shift } from '@/types/shift';
import { LogEntry, LogType } from '@/types/log';
import { ShiftAssignment } from '@/types/shift-assignment';
import { WorkingShift } from '@/types/working-shift';
import { initialStores, initialEmployees, initialShifts, initialShifts2 } from './initialData';

let dbData: {
  employees: Employee[];
  stores: Store[];
  shifts: Shift[];
  logs: LogEntry[];
  assignments: ShiftAssignment[];
  workingShifts: WorkingShift[];
} | null = null;

async function readDb() {
  if (dbData) return dbData;

  try {
    const storedData = localStorage.getItem('arbeitsplan_db');
    if (storedData) {
      dbData = JSON.parse(storedData);
      // Ensure all arrays exist
      if (!dbData) {
        throw new Error('Invalid database data');
      }
      if (!dbData.workingShifts) {
        dbData.workingShifts = [];
      }
      if (!dbData.shifts) {
        dbData.shifts = [];
      }
      if (!dbData.employees) {
        dbData.employees = [];
      }
      if (!dbData.stores) {
        dbData.stores = [];
      }
      if (!dbData.logs) {
        dbData.logs = [];
      }
      if (!dbData.assignments) {
        dbData.assignments = [];
      }
    } else {
      // Initialize with example data
      dbData = {
        employees: initialEmployees,
        stores: initialStores,
        shifts: initialShifts,
        logs: [],
        assignments: [],
        workingShifts: [...initialShifts, ...initialShifts2]
      };
      // Save the initialized data
      localStorage.setItem('arbeitsplan_db', JSON.stringify(dbData));
    }
    return dbData;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    // Fallback to example data on error
    dbData = {
      employees: initialEmployees,
      stores: initialStores,
      shifts: initialShifts,
      logs: [],
      assignments: [],
      workingShifts: [...initialShifts, ...initialShifts2]
    };
    return dbData;
  }
}

async function writeDb(data: typeof dbData) {
  if (!data) throw new Error('No data to write');
  try {
    localStorage.setItem('arbeitsplan_db', JSON.stringify(data));
    dbData = data;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    throw error;
  }
}

export const dbService = {
  // Reset database
  async resetDatabase(): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    dbData = {
      employees: initialEmployees,
      stores: initialStores,
      shifts: initialShifts,
      logs: [],
      assignments: [],
      workingShifts: [...initialShifts, ...initialShifts2]
    };
    await writeDb(dbData);
    await dbService.addLogEntry('success', 'Datenbank wurde erfolgreich zurückgesetzt');
  },

  // Store operations
  async getStores(): Promise<Store[]> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    return db.stores;
  },

  async getStore(id: string): Promise<Store | undefined> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    return db.stores.find(store => store.id === id);
  },

  async addStore(store: Omit<Store, 'id'>): Promise<string> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    const id = crypto.randomUUID();
    const newStore: Store = {
      ...store,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.stores.push(newStore);
    await writeDb(db);
    await dbService.addLogEntry('success', `Store ${newStore.id} wurde erfolgreich erstellt`);
    return id;
  },

  async updateStore(id: string, storeData: Partial<Store>): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    const index = db.stores.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Store not found');
    db.stores[index] = {
      ...db.stores[index],
      ...storeData,
      updatedAt: new Date().toISOString()
    };
    await writeDb(db);
    await dbService.addLogEntry('info', `Store ${id} wurde aktualisiert: ${JSON.stringify(storeData)}`);
  },

  async deleteStore(id: string): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    const index = db.stores.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Store not found');
    db.stores.splice(index, 1);
    await writeDb(db);
    await dbService.addLogEntry('success', `Store ${id} wurde erfolgreich gelöscht`);
  },

  async saveStore(store: Store): Promise<void> {
    try {
      const db = await readDb();
      if (!db) throw new Error('Database not initialized');
      db.stores = db.stores || [];
      
      // Wenn die Store-ID bereits existiert, aktualisiere den Store
      const index = db.stores.findIndex(s => s.id === store.id);
      if (index !== -1) {
        db.stores[index] = store;
      } else {
        // Füge einen neuen Store hinzu
        db.stores.push(store);
      }
      
      await writeDb(db);
    } catch (error) {
      console.error('Error saving store:', error);
      throw error;
    }
  },

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    try {
      const db = await readDb();
      console.log('Raw employees from DB:', db.employees);
      return db.employees || [];
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    const db = await readDb();
    return db.employees.find(e => e.id === id);
  },

  async addEmployee(employee: Omit<Employee, 'id'>): Promise<string> {
    const db = await readDb();
    const id = crypto.randomUUID();
    
    const newEmployee: Employee = {
      id,
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.employees.push(newEmployee);
    await writeDb(db);
    await dbService.addLogEntry('success', `Mitarbeiter ${newEmployee.id} wurde erfolgreich erstellt`);
    return id;
  },

  async updateEmployee(id: string, employeeData: Partial<Employee>): Promise<void> {
    const db = await readDb();
    const index = db.employees.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error('Employee not found');
    }

    db.employees[index] = {
      ...db.employees[index],
      ...employeeData,
      updatedAt: new Date().toISOString()
    };

    await writeDb(db);
    await dbService.addLogEntry('info', `Mitarbeiter ${id} wurde aktualisiert: ${JSON.stringify(employeeData)}`);
  },

  async deleteEmployee(id: string): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');

    const index = db.employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');

    db.employees.splice(index, 1);
    await writeDb(db);
    await dbService.addLogEntry('success', `Mitarbeiter ${id} wurde erfolgreich gelöscht`);
  },

  async deleteEmployeeWithAssignments(id: string): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');

    const index = db.employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');

    // Lösche alle Schichtzuweisungen des Mitarbeiters
    db.assignments = db.assignments.filter(assignment => assignment.employeeId !== id);

    // Lösche den Mitarbeiter
    db.employees.splice(index, 1);

    await writeDb(db);
    await dbService.addLogEntry('warning', `Mitarbeiter ${id} wurde mit allen Schichtzuweisungen gelöscht`);
  },

  // Log operations
  async getLogEntries(): Promise<LogEntry[]> {
    const db = await readDb();
    if (!db?.logs) return [];
    return db.logs;
  },

  async clearLogs(): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    db.logs = [];
    await writeDb(db);
    await dbService.addLogEntry('success', 'Logbuch wurde erfolgreich gelöscht');
  },

  async addLogEntry(type: LogType, message: string, details?: any): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');

    // Ensure logs array exists
    if (!Array.isArray(db.logs)) {
      db.logs = [];
    }

    // Validate log type
    const validTypes = ['info', 'success', 'warning', 'error'] as const;
    const validType = validTypes.includes(type as any) ? type : 'info';

    // Format details if they exist
    let formattedDetails: string | undefined;
    if (details !== undefined) {
      formattedDetails = typeof details === 'string' 
        ? details 
        : JSON.stringify(details, null, 2);
    }

    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      type: validType,
      message: message || 'Keine Nachricht',
      details: formattedDetails,
      timestamp: new Date().toISOString(),
    };

    // Add to beginning of array (newest first)
    db.logs.unshift(newLog);

    // Keep only the last 1000 entries
    if (db.logs.length > 1000) {
      db.logs = db.logs.slice(0, 1000);
    }

    await writeDb(db);
  },

  // Shift operations
  async getShifts(storeId?: string): Promise<Shift[]> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');

    if (storeId) {
      return db.shifts.filter(shift => shift.storeId === storeId);
    }
    return db.shifts;
  },

  async getShift(id: string): Promise<Shift | undefined> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    return db.shifts.find(shift => shift.id === id);
  },

  async addShift(shift: Omit<Shift, 'id'>): Promise<Shift> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const newShift: Shift = {
      ...shift,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.shifts.push(newShift);
    await writeDb(db);
    return newShift;
  },

  async updateShift(id: string, shiftData: Partial<Shift>): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');

    const shiftIndex = db.shifts.findIndex(shift => shift.id === id);
    if (shiftIndex === -1) throw new Error('Shift not found');

    // Erstelle eine neue Kopie der Schicht
    const updatedShift = {
      ...db.shifts[shiftIndex],
      ...shiftData,
      updatedAt: new Date().toISOString(),
      // Stelle sicher, dass die ID nicht überschrieben wird
      id: db.shifts[shiftIndex].id
    };

    // Ersetze die alte Schicht mit der aktualisierten Version
    db.shifts[shiftIndex] = updatedShift;

    // Speichere die Änderungen in der Datenbank
    await writeDb(db);

    // Füge einen Log-Eintrag hinzu
    await this.addLogEntry('info', `Schicht ${id} wurde aktualisiert: ${JSON.stringify(shiftData)}`);
  },

  async deleteShift(id: string): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');

    const shiftIndex = db.shifts.findIndex(shift => shift.id === id);
    if (shiftIndex === -1) throw new Error('Shift not found');

    db.shifts.splice(shiftIndex, 1);
    await writeDb(db);
    await this.addLogEntry('success', `Schicht ${id} wurde erfolgreich gelöscht`);
  },

  async getShiftsByStore(storeId: string): Promise<Shift[]> {
    const db = await readDb();
    return db.shifts
      .filter(shift => shift.storeId.toString() === storeId.toString())
      .map(shift => ({
        ...shift,
        id: shift.id.toString(),
        employeeId: shift.employeeId.toString(),
        storeId: shift.storeId.toString(),
        shiftId: shift.shiftId.toString()
      }));
  },

  async addWorkingShift(shift: Omit<WorkingShift, 'id'>): Promise<string> {
    const db = await readDb();
    if (!db.workingShifts) {
      db.workingShifts = [];
    }
    const id = crypto.randomUUID();
    const newShift: WorkingShift = {
      ...shift,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.workingShifts.push(newShift);
    await writeDb(db);
    await dbService.addLogEntry('success', `Neue Arbeitszeit "${shift.title}" wurde erstellt`);
    return id;
  },

  async updateWorkingShift(id: string, shiftData: Partial<WorkingShift>): Promise<void> {
    const db = await readDb();
    const index = db.workingShifts.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Arbeitszeit nicht gefunden');
    
    const updatedShift = {
      ...db.workingShifts[index],
      ...shiftData,
      updatedAt: new Date().toISOString()
    };
    db.workingShifts[index] = updatedShift;
    await writeDb(db);
    await dbService.addLogEntry('info', `Arbeitszeit "${updatedShift.title}" wurde aktualisiert`);
  },

  async deleteWorkingShift(id: string): Promise<void> {
    const db = await readDb();
    const shift = db.workingShifts.find(s => s.id === id);
    if (!shift) throw new Error('Arbeitszeit nicht gefunden');
    
    db.workingShifts = db.workingShifts.filter(s => s.id !== id);
    await writeDb(db);
    await dbService.addLogEntry('success', `Arbeitszeit "${shift.title}" wurde gelöscht`);
  },

  async getWorkingShifts(): Promise<WorkingShift[]> {
    const db = await readDb();
    if (!db.workingShifts || db.workingShifts.length === 0) {
      // Initialisiere nur mit den Schichten für /schichten2
      db.workingShifts = initialShifts2;
      await writeDb(db);
      await dbService.addLogEntry('success', 'Arbeitszeiten wurden initialisiert');
    }
    return db.workingShifts;
  },

  // Assignment operations
  async getAssignments(storeId?: string): Promise<ShiftAssignment[]> {
    try {
      const db = await readDb();
      if (!db) throw new Error('Database not initialized');
      if (!db.assignments) {
        return [];
      }
      
      if (storeId) {
        return db.assignments.filter(assignment => 
          assignment.storeId.toString() === storeId.toString()
        );
      }
      
      return db.assignments;
    } catch (error) {
      console.error('Error getting assignments:', error);
      return [];
    }
  },

  async addAssignment(assignment: Omit<ShiftAssignment, 'id'>): Promise<string> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    const id = crypto.randomUUID();
    
    if (!db.assignments) {
      db.assignments = [];
    }

    const newAssignment: ShiftAssignment = {
      id,
      ...assignment
    };

    db.assignments.push(newAssignment);
    await writeDb(db);
    
    return id;
  },

  async updateAssignment(id: string, assignmentData: Partial<ShiftAssignment>): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    
    if (!db.assignments) {
      db.assignments = [];
    }

    const index = db.assignments.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Assignment not found');
    }

    db.assignments[index] = {
      ...db.assignments[index],
      ...assignmentData
    };

    await writeDb(db);
  },

  async deleteAssignment(id: string): Promise<void> {
    const db = await readDb();
    if (!db) throw new Error('Database not initialized');
    
    if (!db.assignments) {
      db.assignments = [];
      return;
    }

    const index = db.assignments.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Assignment not found');
    }

    db.assignments.splice(index, 1);
    await writeDb(db);
  },

  async saveAssignment(assignment: ShiftAssignment): Promise<void> {
    try {
      const db = await readDb();
      if (!db) throw new Error('Database not initialized');
      db.assignments = db.assignments || [];
      db.assignments.push(assignment);
      await writeDb(db);
    } catch (error) {
      console.error('Error saving assignment:', error);
      throw error;
    }
  },
};
