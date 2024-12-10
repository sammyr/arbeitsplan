import { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { initialStores, initialEmployees, initialShifts2 } from './initialData.js';
const dbService = {
    // Reset database
    async resetDatabase() {
        try {
            // Delete all documents from each collection
            const collections = ['employees', 'stores', 'shifts', 'logs', 'assignments', 'workingShifts'];
            for (const collectionName of collections) {
                const querySnapshot = await getDocs(collection(db, collectionName));
                const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
            }
            // Add initial data
            for (const employee of initialEmployees) {
                await addDoc(collection(db, 'employees'), Object.assign(Object.assign({}, employee), { createdAt: new Date(), updatedAt: new Date() }));
            }
            for (const store of initialStores) {
                await addDoc(collection(db, 'stores'), Object.assign(Object.assign({}, store), { createdAt: new Date(), updatedAt: new Date() }));
            }
            for (const shift of initialShifts2) {
                await addDoc(collection(db, 'shifts'), Object.assign(Object.assign({}, shift), { createdAt: new Date(), updatedAt: new Date() }));
            }
            await this.addLogEntry('success', 'Datenbank wurde erfolgreich zurückgesetzt');
        }
        catch (error) {
            console.error('Error resetting database:', error);
            throw error;
        }
    },
    // Store operations
    async getStores() {
        try {
            const storesRef = collection(db, 'stores');
            const querySnapshot = await getDocs(storesRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting stores:', error);
            throw error;
        }
    },
    async getStore(id) {
        try {
            const docRef = doc(db, 'stores', id);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return Object.assign({ id: docSnapshot.id }, docSnapshot.data());
            }
            return undefined;
        }
        catch (error) {
            console.error('Error getting store:', error);
            throw error;
        }
    },
    async addStore(store) {
        try {
            const docRef = await addDoc(collection(db, 'stores'), Object.assign(Object.assign({}, store), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding store:', error);
            throw error;
        }
    },
    async updateStore(id, storeData) {
        try {
            const docRef = doc(db, 'stores', id);
            await updateDoc(docRef, Object.assign(Object.assign({}, storeData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating store:', error);
            throw error;
        }
    },
    async deleteStore(id) {
        try {
            await deleteDoc(doc(db, 'stores', id));
        }
        catch (error) {
            console.error('Error deleting store:', error);
            throw error;
        }
    },
    // Employee operations
    async getEmployees() {
        try {
            const employeesRef = collection(db, 'employees');
            const querySnapshot = await getDocs(employeesRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting employees:', error);
            throw error;
        }
    },
    async getEmployee(id) {
        try {
            const docRef = doc(db, 'employees', id);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return Object.assign({ id: docSnapshot.id }, docSnapshot.data());
            }
            return undefined;
        }
        catch (error) {
            console.error('Error getting employee:', error);
            throw error;
        }
    },
    async addEmployee(employee) {
        try {
            const docRef = await addDoc(collection(db, 'employees'), Object.assign(Object.assign({}, employee), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    },
    async updateEmployee(id, employeeData) {
        try {
            const docRef = doc(db, 'employees', id);
            await updateDoc(docRef, Object.assign(Object.assign({}, employeeData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    },
    async deleteEmployee(id) {
        try {
            await deleteDoc(doc(db, 'employees', id));
        }
        catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    },
    // Log operations
    async getLogEntries() {
        try {
            const logsRef = collection(db, 'logs');
            const querySnapshot = await getDocs(logsRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting logs:', error);
            throw error;
        }
    },
    async clearLogs() {
        try {
            const querySnapshot = await getDocs(collection(db, 'logs'));
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        }
        catch (error) {
            console.error('Error clearing logs:', error);
            throw error;
        }
    },
    async addLogEntry(type, message, details) {
        try {
            await addDoc(collection(db, 'logs'), {
                type,
                message,
                details,
                createdAt: new Date()
            });
        }
        catch (error) {
            console.error('Error adding log entry:', error);
            throw error;
        }
    },
    // Shift operations
    async getShifts(storeId) {
        try {
            const shiftsRef = collection(db, 'shifts');
            const q = storeId
                ? query(shiftsRef, where('storeId', '==', storeId))
                : shiftsRef;
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting shifts:', error);
            throw error;
        }
    },
    async getShift(id) {
        try {
            const docRef = doc(db, 'shifts', id);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return Object.assign({ id: docSnapshot.id }, docSnapshot.data());
            }
            return undefined;
        }
        catch (error) {
            console.error('Error getting shift:', error);
            throw error;
        }
    },
    async addShift(shift) {
        try {
            const docRef = await addDoc(collection(db, 'shifts'), Object.assign(Object.assign({}, shift), { createdAt: new Date(), updatedAt: new Date() }));
            return Object.assign({ id: docRef.id }, shift);
        }
        catch (error) {
            console.error('Error adding shift:', error);
            throw error;
        }
    },
    async updateShift(id, shiftData) {
        try {
            const docRef = doc(db, 'shifts', id);
            await updateDoc(docRef, Object.assign(Object.assign({}, shiftData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating shift:', error);
            throw error;
        }
    },
    async deleteShift(id) {
        try {
            await deleteDoc(doc(db, 'shifts', id));
        }
        catch (error) {
            console.error('Error deleting shift:', error);
            throw error;
        }
    },
    // Working Shifts operations
    async getWorkingShifts() {
        try {
            const workingShiftsRef = collection(db, 'workingShifts');
            const querySnapshot = await getDocs(workingShiftsRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting working shifts:', error);
            throw error;
        }
    },
    async addWorkingShift(shift) {
        try {
            const docRef = await addDoc(collection(db, 'workingShifts'), Object.assign(Object.assign({}, shift), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding working shift:', error);
            throw error;
        }
    },
    async updateWorkingShift(id, shiftData) {
        try {
            const docRef = doc(db, 'workingShifts', id);
            await updateDoc(docRef, Object.assign(Object.assign({}, shiftData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating working shift:', error);
            throw error;
        }
    },
    async deleteWorkingShift(id) {
        try {
            await deleteDoc(doc(db, 'workingShifts', id));
        }
        catch (error) {
            console.error('Error deleting working shift:', error);
            throw error;
        }
    },
    // Assignment operations
    async getAssignments(storeId) {
        try {
            const assignmentsRef = collection(db, 'assignments');
            const q = storeId
                ? query(assignmentsRef, where('storeId', '==', storeId))
                : assignmentsRef;
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting assignments:', error);
            throw error;
        }
    },
    async addAssignment(assignment) {
        try {
            const docRef = await addDoc(collection(db, 'assignments'), Object.assign(Object.assign({}, assignment), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding assignment:', error);
            throw error;
        }
    },
    async updateAssignment(id, assignmentData) {
        try {
            const docRef = doc(db, 'assignments', id);
            await updateDoc(docRef, Object.assign(Object.assign({}, assignmentData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating assignment:', error);
            throw error;
        }
    },
    async deleteAssignment(id) {
        try {
            await deleteDoc(doc(db, 'assignments', id));
        }
        catch (error) {
            console.error('Error deleting assignment:', error);
            throw error;
        }
    }
};
export { dbService };
