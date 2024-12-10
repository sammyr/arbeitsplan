"use strict";
const { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc, getDoc } = require('firebase/firestore');
const { db } = require('./firebase');
const { Store } = require('@/types/store');
const { Employee } = require('@/types/employee');
const { Shift } = require('@/types/shift');
const { ShiftAssignment } = require('@/types/shift-assignment');
const { WorkingShift } = require('@/types/working-shift');
const { initialStores, initialEmployees, initialShifts, initialShifts2 } = require('./initialData');
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
            const querySnapshot = await getDocs(collection(db, 'stores'));
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting stores:', error);
            return [];
        }
    },
    async getStore(id) {
        try {
            const docRef = doc(db, 'stores', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return Object.assign({ id: docSnap.id }, docSnap.data());
            }
            return undefined;
        }
        catch (error) {
            console.error('Error getting store:', error);
            return undefined;
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
            const querySnapshot = await getDocs(collection(db, 'employees'));
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting employees:', error);
            return [];
        }
    },
    async getEmployee(id) {
        try {
            const docRef = doc(db, 'employees', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return Object.assign({ id: docSnap.id }, docSnap.data());
            }
            return undefined;
        }
        catch (error) {
            console.error('Error getting employee:', error);
            return undefined;
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
            const querySnapshot = await getDocs(collection(db, 'logs'));
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting log entries:', error);
            return [];
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
            const logEntry = {
                type,
                message,
                details: details ? JSON.stringify(details) : undefined,
                timestamp: new Date().toISOString()
            };
            await addDoc(collection(db, 'logs'), logEntry);
        }
        catch (error) {
            console.error('Error adding log entry:', error);
        }
    },
    // Shift operations
    async getShifts(storeId) {
        try {
            let q = collection(db, 'shifts');
            if (storeId) {
                q = query(q, where('storeId', '==', storeId));
            }
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting shifts:', error);
            return [];
        }
    },
    async getShift(id) {
        try {
            const docRef = doc(db, 'shifts', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return Object.assign({ id: docSnap.id }, docSnap.data());
            }
            return undefined;
        }
        catch (error) {
            console.error('Error getting shift:', error);
            return undefined;
        }
    },
    async addShift(shift) {
        try {
            const newShift = Object.assign(Object.assign({}, shift), { employeeId: '', shiftId: '', storeId: '', workHours: 8, date: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            const docRef = await addDoc(collection(db, 'shifts'), newShift);
            return Object.assign(Object.assign({}, newShift), { id: docRef.id });
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
            const querySnapshot = await getDocs(collection(db, 'workingShifts'));
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting working shifts:', error);
            return [];
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
            let q = collection(db, 'assignments');
            if (storeId) {
                q = query(q, where('storeId', '==', storeId));
            }
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting assignments:', error);
            return [];
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
module.exports = { dbService };
