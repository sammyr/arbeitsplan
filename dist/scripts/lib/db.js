"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbService = void 0;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("./firebase");
const initialData_1 = require("./initialData");
const dbService = {
    // Reset database
    async resetDatabase() {
        try {
            // Delete all documents from each collection
            const collections = ['employees', 'stores', 'shifts', 'logs', 'assignments', 'workingShifts'];
            for (const collectionName of collections) {
                const querySnapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, collectionName));
                const deletePromises = querySnapshot.docs.map(doc => (0, firestore_1.deleteDoc)(doc.ref));
                await Promise.all(deletePromises);
            }
            // Add initial data
            for (const employee of initialData_1.initialEmployees) {
                await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'employees'), Object.assign(Object.assign({}, employee), { createdAt: new Date(), updatedAt: new Date() }));
            }
            for (const store of initialData_1.initialStores) {
                await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'stores'), Object.assign(Object.assign({}, store), { createdAt: new Date(), updatedAt: new Date() }));
            }
            for (const shift of initialData_1.initialShifts2) {
                await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'shifts'), Object.assign(Object.assign({}, shift), { createdAt: new Date(), updatedAt: new Date() }));
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
            const storesRef = (0, firestore_1.collection)(firebase_1.db, 'stores');
            const querySnapshot = await (0, firestore_1.getDocs)(storesRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting stores:', error);
            throw error;
        }
    },
    async getStore(id) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'stores', id);
            const docSnapshot = await (0, firestore_1.getDoc)(docRef);
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
            const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'stores'), Object.assign(Object.assign({}, store), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding store:', error);
            throw error;
        }
    },
    async updateStore(id, storeData) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'stores', id);
            await (0, firestore_1.updateDoc)(docRef, Object.assign(Object.assign({}, storeData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating store:', error);
            throw error;
        }
    },
    async deleteStore(id) {
        try {
            await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(firebase_1.db, 'stores', id));
        }
        catch (error) {
            console.error('Error deleting store:', error);
            throw error;
        }
    },
    // Employee operations
    async getEmployees() {
        try {
            const employeesRef = (0, firestore_1.collection)(firebase_1.db, 'employees');
            const querySnapshot = await (0, firestore_1.getDocs)(employeesRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting employees:', error);
            throw error;
        }
    },
    async getEmployee(id) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'employees', id);
            const docSnapshot = await (0, firestore_1.getDoc)(docRef);
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
            const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'employees'), Object.assign(Object.assign({}, employee), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    },
    async updateEmployee(id, employeeData) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'employees', id);
            await (0, firestore_1.updateDoc)(docRef, Object.assign(Object.assign({}, employeeData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    },
    async deleteEmployee(id) {
        try {
            await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(firebase_1.db, 'employees', id));
        }
        catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    },
    // Log operations
    async getLogEntries() {
        try {
            const logsRef = (0, firestore_1.collection)(firebase_1.db, 'logs');
            const querySnapshot = await (0, firestore_1.getDocs)(logsRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting logs:', error);
            throw error;
        }
    },
    async clearLogs() {
        try {
            const querySnapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'logs'));
            const deletePromises = querySnapshot.docs.map(doc => (0, firestore_1.deleteDoc)(doc.ref));
            await Promise.all(deletePromises);
        }
        catch (error) {
            console.error('Error clearing logs:', error);
            throw error;
        }
    },
    async addLogEntry(type, message, details) {
        try {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'logs'), {
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
            const shiftsRef = (0, firestore_1.collection)(firebase_1.db, 'shifts');
            const q = storeId
                ? (0, firestore_1.query)(shiftsRef, (0, firestore_1.where)('storeId', '==', storeId))
                : shiftsRef;
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting shifts:', error);
            throw error;
        }
    },
    async getShift(id) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'shifts', id);
            const docSnapshot = await (0, firestore_1.getDoc)(docRef);
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
            const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'shifts'), Object.assign(Object.assign({}, shift), { createdAt: new Date(), updatedAt: new Date() }));
            return Object.assign({ id: docRef.id }, shift);
        }
        catch (error) {
            console.error('Error adding shift:', error);
            throw error;
        }
    },
    async updateShift(id, shiftData) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'shifts', id);
            await (0, firestore_1.updateDoc)(docRef, Object.assign(Object.assign({}, shiftData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating shift:', error);
            throw error;
        }
    },
    async deleteShift(id) {
        try {
            await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(firebase_1.db, 'shifts', id));
        }
        catch (error) {
            console.error('Error deleting shift:', error);
            throw error;
        }
    },
    // Working Shifts operations
    async getWorkingShifts() {
        try {
            const workingShiftsRef = (0, firestore_1.collection)(firebase_1.db, 'workingShifts');
            const querySnapshot = await (0, firestore_1.getDocs)(workingShiftsRef);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting working shifts:', error);
            throw error;
        }
    },
    async addWorkingShift(shift) {
        try {
            const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'workingShifts'), Object.assign(Object.assign({}, shift), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding working shift:', error);
            throw error;
        }
    },
    async updateWorkingShift(id, shiftData) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'workingShifts', id);
            await (0, firestore_1.updateDoc)(docRef, Object.assign(Object.assign({}, shiftData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating working shift:', error);
            throw error;
        }
    },
    async deleteWorkingShift(id) {
        try {
            await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(firebase_1.db, 'workingShifts', id));
        }
        catch (error) {
            console.error('Error deleting working shift:', error);
            throw error;
        }
    },
    // Assignment operations
    async getAssignments(storeId) {
        try {
            const assignmentsRef = (0, firestore_1.collection)(firebase_1.db, 'assignments');
            const q = storeId
                ? (0, firestore_1.query)(assignmentsRef, (0, firestore_1.where)('storeId', '==', storeId))
                : assignmentsRef;
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            return querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            console.error('Error getting assignments:', error);
            throw error;
        }
    },
    async addAssignment(assignment) {
        try {
            const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'assignments'), Object.assign(Object.assign({}, assignment), { createdAt: new Date(), updatedAt: new Date() }));
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding assignment:', error);
            throw error;
        }
    },
    async updateAssignment(id, assignmentData) {
        try {
            const docRef = (0, firestore_1.doc)(firebase_1.db, 'assignments', id);
            await (0, firestore_1.updateDoc)(docRef, Object.assign(Object.assign({}, assignmentData), { updatedAt: new Date() }));
        }
        catch (error) {
            console.error('Error updating assignment:', error);
            throw error;
        }
    },
    async deleteAssignment(id) {
        try {
            await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(firebase_1.db, 'assignments', id));
        }
        catch (error) {
            console.error('Error deleting assignment:', error);
            throw error;
        }
    }
};
exports.dbService = dbService;
