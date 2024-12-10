"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateToFirebase = migrateToFirebaseImpl;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("./firebase");
const db_1 = require("./db");
async function migrateToFirebaseImpl() {
    try {
        // Get all data from localStorage
        const data = {
            employees: await db_1.dbService.getEmployees(),
            stores: await db_1.dbService.getStores(),
            shifts: await db_1.dbService.getShifts(),
            workingShifts: await db_1.dbService.getWorkingShifts(),
            assignments: await db_1.dbService.getAssignments(),
            logs: await db_1.dbService.getLogEntries()
        };
        // Migrate employees
        console.log('Migrating employees...');
        for (const employee of data.employees) {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'employees'), Object.assign(Object.assign({}, employee), { createdAt: new Date(employee.createdAt), updatedAt: new Date(employee.updatedAt) }));
        }
        // Migrate stores
        console.log('Migrating stores...');
        for (const store of data.stores) {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'stores'), Object.assign(Object.assign({}, store), { createdAt: new Date(store.createdAt), updatedAt: new Date(store.updatedAt) }));
        }
        // Migrate shifts
        console.log('Migrating shifts...');
        for (const shift of data.shifts) {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'shifts'), Object.assign(Object.assign({}, shift), { date: new Date(shift.date), createdAt: new Date(shift.createdAt), updatedAt: new Date(shift.updatedAt) }));
        }
        // Migrate working shifts
        console.log('Migrating working shifts...');
        for (const workingShift of data.workingShifts) {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'workingShifts'), Object.assign(Object.assign({}, workingShift), { date: new Date(workingShift.date), createdAt: new Date(workingShift.createdAt), updatedAt: new Date(workingShift.updatedAt) }));
        }
        // Migrate assignments
        console.log('Migrating assignments...');
        for (const assignment of data.assignments) {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'assignments'), Object.assign(Object.assign({}, assignment), { date: new Date(assignment.date), createdAt: new Date(assignment.createdAt), updatedAt: new Date(assignment.updatedAt) }));
        }
        // Migrate logs
        console.log('Migrating logs...');
        for (const log of data.logs) {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'logs'), Object.assign(Object.assign({}, log), { createdAt: new Date(log.createdAt) }));
        }
        console.log('Migration completed successfully!');
    }
    catch (error) {
        console.error('Error during migration:', error);
        throw error;
    }
}
// Helper function to check if data already exists in Firestore
async function collectionIsEmpty(collectionName) {
    const querySnapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, collectionName));
    return querySnapshot.empty;
}
