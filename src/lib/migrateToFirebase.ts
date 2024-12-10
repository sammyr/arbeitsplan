import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase.js';
import { dbService } from './db.js';
import type { Store } from '@/types/store.js';
import type { Employee } from '@/types/employee.js';
import type { Shift } from '@/types/shift.js';
import type { ShiftAssignment } from '@/types/shift-assignment.js';
import type { WorkingShift } from '@/types/working-shift.js';

interface LocalStorageData {
  employees: Employee[];
  stores: Store[];
  shifts: Shift[];
  workingShifts: WorkingShift[];
  assignments: ShiftAssignment[];
  logs: any[];
}

async function migrateToFirebaseImpl() {
  try {
    // Get all data from localStorage
    const data: LocalStorageData = {
      employees: await dbService.getEmployees(),
      stores: await dbService.getStores(),
      shifts: await dbService.getShifts(),
      workingShifts: await dbService.getWorkingShifts(),
      assignments: await dbService.getAssignments(),
      logs: await dbService.getLogEntries()
    };

    // Migrate employees
    console.log('Migrating employees...');
    for (const employee of data.employees) {
      await addDoc(collection(db, 'mitarbeiter'), {
        ...employee,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      });
    }

    // Migrate stores
    console.log('Migrating stores...');
    for (const store of data.stores) {
      await addDoc(collection(db, 'filialen'), {
        ...store,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      });
    }

    // Migrate shifts
    console.log('Migrating shifts...');
    for (const shift of data.shifts) {
      await addDoc(collection(db, 'shifts'), {
        ...shift,
        date: shift.date,
        createdAt: shift.createdAt,
        updatedAt: shift.updatedAt
      });
    }

    // Migrate working shifts
    console.log('Migrating working shifts...');
    for (const workingShift of data.workingShifts) {
      await addDoc(collection(db, 'workingShifts'), {
        ...workingShift,
        date: workingShift.date,
        createdAt: workingShift.createdAt,
        updatedAt: workingShift.updatedAt
      });
    }

    // Migrate assignments
    console.log('Migrating assignments...');
    for (const assignment of data.assignments) {
      await addDoc(collection(db, 'assignments'), {
        ...assignment,
        date: assignment.date,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt
      });
    }

    // Migrate logs
    console.log('Migrating logs...');
    for (const log of data.logs) {
      await addDoc(collection(db, 'logs'), {
        ...log,
        createdAt: log.createdAt
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Helper function to check if data already exists in Firestore
async function collectionIsEmpty(collectionName: string): Promise<boolean> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.empty;
}

export { migrateToFirebaseImpl as migrateToFirebase };
