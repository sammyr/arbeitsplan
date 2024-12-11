import { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc, getDoc, CollectionReference, DocumentData, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Store } from '@/types/store';
import type { Employee } from '@/types/employee';
import type { Shift } from '@/types/shift';
import type { ShiftAssignment } from '@/types/shift-assignment';
import type { WorkingShift } from '@/types/working-shift';
import { localStorageService } from './localStorageService'; // Import localStorageService
import type { LogType } from '@/types/log'; // Import LogType

const dbService = {
  // Reset database
  async resetDatabase(): Promise<void> {
    try {
      // Delete all documents from each collection
      const collections = ['mitarbeiter', 'stores', 'shifts', 'logs', 'assignments', 'workingShifts'];
      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      await this.addLogEntry('success', 'Datenbank wurde erfolgreich zurückgesetzt');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  },

  // Store operations
  async getStores(organizationId?: string): Promise<Store[]> {
    if (!organizationId) return [];
    
    try {
      console.log('Getting stores for organization:', organizationId);
      const storesRef = collection(db, 'stores');
      const q = query(
        storesRef,
        where('organizationId', '==', organizationId)
      );
      
      console.log('Executing stores query...');
      const querySnapshot = await getDocs(q);
      console.log('Raw query result size:', querySnapshot.size);
      
      const stores = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          organizationId: data.organizationId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Store;
      });
      
      console.log('Processed stores:', stores);
      return stores;
    } catch (error) {
      console.error('Error getting stores:', error);
      throw error;
    }
  },

  async getStore(id: string): Promise<Store | undefined> {
    try {
      const docRef = doc(db, 'stores', id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() } as Store;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting store:', error);
      throw error;
    }
  },

  async addStore(store: Omit<Store, 'id'>): Promise<Store> {
    try {
      const docRef = await addDoc(collection(db, 'stores'), {
        ...store,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        ...store,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding store:', error);
      throw error;
    }
  },

  async updateStore(id: string, storeData: Partial<Store>): Promise<void> {
    try {
      const docRef = doc(db, 'stores', id);
      await updateDoc(docRef, {
        ...storeData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  },

  async deleteStore(id: string): Promise<void> {
    try {
      console.log('Starting store deletion process for store:', id);
      
      // First, get all assignments for this store
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('storeId', '==', id)
      );
      
      console.log('Fetching assignments for store');
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      console.log('Found assignments:', assignmentsSnapshot.size);

      // Delete all assignments
      console.log('Deleting assignments...');
      const deleteAssignments = assignmentsSnapshot.docs.map(doc => {
        console.log('Deleting assignment:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteAssignments);
      console.log('All assignments deleted');

      // Get all shifts for this store
      const shiftsQuery = query(
        collection(db, 'shifts'),
        where('storeId', '==', id)
      );
      
      console.log('Fetching shifts for store');
      const shiftsSnapshot = await getDocs(shiftsQuery);
      console.log('Found shifts:', shiftsSnapshot.size);

      // Delete all shifts
      console.log('Deleting shifts...');
      const deleteShifts = shiftsSnapshot.docs.map(doc => {
        console.log('Deleting shift:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteShifts);
      console.log('All shifts deleted');

      // Finally delete the store itself
      console.log('Deleting store document');
      await deleteDoc(doc(db, 'stores', id));
      console.log('Store document deleted');
      
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  },

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    try {
      const employeesRef = collection(db, 'mitarbeiter') as CollectionReference<DocumentData>;
      const querySnapshot = await getDocs(employeesRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    try {
      const docRef = doc(db, 'mitarbeiter', id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() } as Employee;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting employee:', error);
      throw error;
    }
  },

  async addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    try {
      const docRef = await addDoc(collection(db, 'mitarbeiter'), {
        ...employee,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        ...employee,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  },

  async updateEmployee(id: string, employeeData: Partial<Employee>): Promise<void> {
    try {
      const docRef = doc(db, 'mitarbeiter', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Employee with ID ${id} does not exist`);
      }

      await updateDoc(docRef, {
        ...employeeData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  async deleteEmployee(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'mitarbeiter', id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },

  async deleteEmployeeWithAssignments(employeeId: string): Promise<void> {
    try {
      console.log('Starting deletion process for employee:', employeeId);
      
      // First, get all assignments for this employee
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('employeeId', '==', employeeId)
      );
      
      console.log('Fetching assignments for employee');
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      console.log('Found assignments:', assignmentsSnapshot.size);

      // Delete all assignments
      console.log('Deleting assignments...');
      const deleteAssignments = assignmentsSnapshot.docs.map(doc => {
        console.log('Deleting assignment:', doc.id);
        return deleteDoc(doc.ref);
      });
      await Promise.all(deleteAssignments);
      console.log('All assignments deleted');

      // Then delete the employee
      console.log('Deleting employee document');
      await deleteDoc(doc(db, 'mitarbeiter', employeeId));
      console.log('Employee document deleted');
      
    } catch (error) {
      console.error('Detailed error in deleteEmployeeWithAssignments:', error);
      throw error;
    }
  },

  async getEmployeesByOrganization(organizationId: string | undefined): Promise<Employee[]> {
    if (!organizationId) return [];
    
    try {
      console.log('Getting employees for organization:', organizationId);
      const employeesRef = collection(db, 'mitarbeiter');
      
      // Create a query that only returns employees with the matching organizationId
      const q = query(
        employeesRef,
        where('organizationId', '==', organizationId)
      );
      
      const querySnapshot = await getDocs(q);
      const employees = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          mobilePhone: data.mobilePhone || '',
          role: data.role || '',
          organizationId: data.organizationId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Employee;
      });
      
      console.log(`Found ${employees.length} employees for organization ${organizationId}`);
      return employees;
    } catch (error) {
      console.error('Error getting employees by organization:', error);
      throw error;
    }
  },

  // Log operations
  async getLogEntries(): Promise<any[]> {
    return localStorageService.getLogs();
  },

  async clearLogs(): Promise<void> {
    localStorageService.clearLogs();
  },

  async addLogEntry(type: LogType, message: string, details?: any): Promise<void> {
    localStorageService.addLog(type, message, details);
  },

  // Shift operations
  async getShifts(storeId?: string): Promise<Shift[]> {
    try {
      const shiftsRef = collection(db, 'shifts') as CollectionReference<DocumentData>;
      const q = storeId
        ? query(shiftsRef, where('storeId', '==', storeId))
        : shiftsRef;
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
    } catch (error) {
      console.error('Error getting shifts:', error);
      throw error;
    }
  },

  async getShift(id: string): Promise<Shift | undefined> {
    try {
      const docRef = doc(db, 'shifts', id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() } as Shift;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting shift:', error);
      throw error;
    }
  },

  async addShift(shift: { title: string; startTime: string; endTime: string }): Promise<WorkingShift> {
    try {
      const docRef = await addDoc(collection(db, 'shifts'), {
        ...shift,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...shift } as WorkingShift;
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  },

  async updateShift(id: string, shiftData: Partial<Shift>): Promise<void> {
    try {
      const docRef = doc(db, 'shifts', id);
      await updateDoc(docRef, {
        ...shiftData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  },

  async deleteShift(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'shifts', id));
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  },

  async getShiftsByOrganization(organizationId: string | undefined): Promise<Shift[]> {
    if (!organizationId) return [];
    
    try {
      const shiftsRef = collection(db, 'shifts') as CollectionReference<DocumentData>;
      const q = query(shiftsRef, where('organizationId', '==', organizationId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
    } catch (error) {
      console.error('Error getting shifts by organization:', error);
      throw error;
    }
  },

  // Working Shifts operations
  async getWorkingShifts(): Promise<WorkingShift[]> {
    try {
      const workingShiftsRef = collection(db, 'workingShifts') as CollectionReference<DocumentData>;
      const querySnapshot = await getDocs(workingShiftsRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkingShift));
    } catch (error) {
      console.error('Error getting working shifts:', error);
      throw error;
    }
  },

  async addWorkingShift(shift: Omit<WorkingShift, 'id'>): Promise<WorkingShift> {
    try {
      const docRef = await addDoc(collection(db, 'workingShifts'), shift);
      return {
        ...shift,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error adding working shift:', error);
      throw error;
    }
  },

  async updateWorkingShift(id: string, shiftData: Partial<WorkingShift>): Promise<void> {
    try {
      const docRef = doc(db, 'workingShifts', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Working shift with ID ${id} does not exist`);
      }

      await updateDoc(docRef, {
        ...shiftData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating working shift:', error);
      throw error;
    }
  },

  async deleteWorkingShift(id: string): Promise<void> {
    try {
      console.log('Attempting to delete working shift:', id);
      
      // First check if the document exists
      const docRef = doc(db, 'workingShifts', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('Working shift already deleted:', id);
        return;
      }

      // Get all documents that match this ID (should only be one, but let's be thorough)
      const q = query(
        collection(db, 'workingShifts'),
        where('id', '==', id)
      );
      const querySnapshot = await getDocs(q);
      
      // Delete all matching documents
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Finally delete the main document
      await deleteDoc(docRef);
      
      console.log('Successfully deleted working shift:', id);
    } catch (error) {
      console.error('Error deleting working shift:', error);
      throw error;
    }
  },

  async getWorkingShiftsByOrganization(organizationId: string | undefined): Promise<WorkingShift[]> {
    if (!organizationId) return [];
    
    try {
      console.log('Getting shifts for organization:', organizationId);
      const shiftsRef = collection(db, 'workingShifts') as CollectionReference<DocumentData>;
      
      // Only filter by organizationId in the query
      const q = query(
        shiftsRef,
        where('organizationId', '==', organizationId)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Raw query result size:', querySnapshot.size);
      
      // Map and validate each document
      const shifts = await Promise.all(
        querySnapshot.docs.map(async (doc, index) => {
          console.log(`Processing shift ${index + 1}/${querySnapshot.size}:`, doc.id);
          
          // Double check that the document actually exists
          const docRef = doc.ref;
          const freshDoc = await getDoc(docRef);
          
          if (!freshDoc.exists()) {
            console.warn(`Shift ${doc.id} does not exist in fresh check`);
            return null;
          }
          
          const data = freshDoc.data();
          console.log(`Shift ${doc.id} data:`, data);
          
          // Validate all required fields
          if (!data || 
              !data.title || 
              !data.startTime || 
              !data.endTime || 
              !data.organizationId ||
              data.title.trim() === '' || 
              data.startTime.trim() === '' || 
              data.endTime.trim() === '') {
            console.warn(`Invalid shift data for ID ${doc.id}:`, {
              hasData: !!data,
              hasTitle: data?.title,
              hasStartTime: data?.startTime,
              hasEndTime: data?.endTime,
              hasOrgId: data?.organizationId,
              titleEmpty: data?.title?.trim() === '',
              startTimeEmpty: data?.startTime?.trim() === '',
              endTimeEmpty: data?.endTime?.trim() === ''
            });
            // Delete invalid shift
            await deleteDoc(docRef);
            return null;
          }
          
          // Convert Firestore timestamps to ISO strings
          const createdAt = data.createdAt instanceof Object && 'seconds' in data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toISOString()
            : typeof data.createdAt === 'string'
              ? data.createdAt
              : new Date().toISOString();
              
          const updatedAt = data.updatedAt instanceof Object && 'seconds' in data.updatedAt
            ? new Date(data.updatedAt.seconds * 1000).toISOString()
            : typeof data.updatedAt === 'string'
              ? data.updatedAt
              : new Date().toISOString();
              
          const date = data.date instanceof Object && 'seconds' in data.date
            ? new Date(data.date.seconds * 1000).toISOString()
            : typeof data.date === 'string'
              ? data.date
              : new Date().toISOString();
          
          // Always use the document ID as the shift ID
          const shift = {
            ...data,
            id: doc.id, // Override any existing id field with the document ID
            createdAt,
            updatedAt,
            date
          } as WorkingShift;
          
          console.log(`Valid shift processed:`, shift);
          return shift;
        })
      );
      
      // Filter out null values (invalid shifts)
      const validShifts = shifts.filter((shift): shift is WorkingShift => shift !== null);
      console.log('Valid shifts found:', validShifts.length, validShifts);
      return validShifts;
    } catch (error) {
      console.error('Error getting working shifts by organization:', error);
      throw error;
    }
  },

  async getWorkplansByOrganization(organizationId: string | undefined): Promise<any[]> {
    if (!organizationId) return [];
    
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('organizationId', '==', organizationId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting workplans by organization:', error);
      throw error;
    }
  },

  // Assignment operations
  async getAssignments(storeId?: string): Promise<ShiftAssignment[]> {
    try {
      const assignmentsRef = collection(db, 'assignments') as CollectionReference<DocumentData>;
      let q;
      
      if (storeId) {
        q = query(assignmentsRef, where('storeId', '==', storeId));
      } else {
        q = assignmentsRef;
      }
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} assignments for store ${storeId || 'all'}`);
      
      const assignments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Assignment data:', { id: doc.id, ...data });
        return { id: doc.id, ...data } as ShiftAssignment;
      });

      return assignments;
    } catch (error) {
      console.error('Error getting assignments:', error);
      throw error;
    }
  },

  async addAssignment(assignment: Omit<ShiftAssignment, 'id'>): Promise<string> {
    try {
      // Ensure date is in YYYY-MM-DD format
      const dateStr = new Date(assignment.date).toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      const docRef = await addDoc(collection(db, 'assignments'), {
        ...assignment,
        date: dateStr,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding assignment:', error);
      throw error;
    }
  },

  async updateAssignment(id: string, assignmentData: Partial<ShiftAssignment>): Promise<void> {
    try {
      const docRef = doc(db, 'assignments', id);
      const updateData = { ...assignmentData };
      
      // If date is being updated, ensure it's in YYYY-MM-DD format
      if (updateData.date) {
        updateData.date = new Date(updateData.date).toISOString().split('T')[0];
      }
      updateData.updatedAt = new Date().toISOString();
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  async deleteAssignment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'assignments', id));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  async getAllAssignmentsByOrganization(organizationId: string | undefined): Promise<ShiftAssignment[]> {
    if (!organizationId) return [];
    
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('organizationId', '==', organizationId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShiftAssignment));
    } catch (error) {
      console.error('Error getting assignments by organization:', error);
      throw error;
    }
  },

  async getAssignmentsByOrganization(organizationId: string | undefined): Promise<ShiftAssignment[]> {
    if (!organizationId) return [];
    
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('organizationId', '==', organizationId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShiftAssignment));
    } catch (error) {
      console.error('Error getting assignments by organization:', error);
      throw error;
    }
  },

  // User-specific assignment operations
  async getUserAssignments(storeId: string, userId: string): Promise<ShiftAssignment[]> {
    try {
      const assignmentsRef = collection(db, 'users', userId, 'assignments');
      const q = query(assignmentsRef, where('storeId', '==', storeId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShiftAssignment));
    } catch (error) {
      console.error('Error getting user assignments:', error);
      throw error;
    }
  },

  async addUserAssignment(assignment: Omit<ShiftAssignment, 'id'>, userId: string): Promise<string> {
    try {
      const assignmentsRef = collection(db, 'users', userId, 'assignments');
      const docRef = await addDoc(assignmentsRef, assignment);
      return docRef.id;
    } catch (error) {
      console.error('Error adding user assignment:', error);
      throw error;
    }
  },

  async updateUserAssignment(id: string, assignment: Partial<ShiftAssignment>, userId: string): Promise<void> {
    try {
      const assignmentRef = doc(db, 'users', userId, 'assignments', id);
      await updateDoc(assignmentRef, assignment);
    } catch (error) {
      console.error('Error updating user assignment:', error);
      throw error;
    }
  },

  async deleteUserAssignment(id: string, userId: string): Promise<void> {
    try {
      const assignmentRef = doc(db, 'assignments', id);
      await deleteDoc(assignmentRef);
    } catch (error) {
      console.error('Error deleting user assignment:', error);
      throw error;
    }
  },

  async createUserDocument(userId: string, email: string, role: 'admin' | 'user' = 'user'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email,
          role,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('User document created successfully');
      }
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }
};

export { dbService };
