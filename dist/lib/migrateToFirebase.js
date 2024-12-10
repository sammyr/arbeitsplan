import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';
import { dbService } from './db.js';
async function migrateToFirebaseImpl() {
    try {
        // Get all data from localStorage
        const data = {
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
            await addDoc(collection(db, 'employees'), Object.assign(Object.assign({}, employee), { createdAt: new Date(employee.createdAt), updatedAt: new Date(employee.updatedAt) }));
        }
        // Migrate stores
        console.log('Migrating stores...');
        for (const store of data.stores) {
            await addDoc(collection(db, 'stores'), Object.assign(Object.assign({}, store), { createdAt: new Date(store.createdAt), updatedAt: new Date(store.updatedAt) }));
        }
        // Migrate shifts
        console.log('Migrating shifts...');
        for (const shift of data.shifts) {
            await addDoc(collection(db, 'shifts'), Object.assign(Object.assign({}, shift), { date: new Date(shift.date), createdAt: new Date(shift.createdAt), updatedAt: new Date(shift.updatedAt) }));
        }
        // Migrate working shifts
        console.log('Migrating working shifts...');
        for (const workingShift of data.workingShifts) {
            await addDoc(collection(db, 'workingShifts'), Object.assign(Object.assign({}, workingShift), { date: new Date(workingShift.date), createdAt: new Date(workingShift.createdAt), updatedAt: new Date(workingShift.updatedAt) }));
        }
        // Migrate assignments
        console.log('Migrating assignments...');
        for (const assignment of data.assignments) {
            await addDoc(collection(db, 'assignments'), Object.assign(Object.assign({}, assignment), { date: new Date(assignment.date), createdAt: new Date(assignment.createdAt), updatedAt: new Date(assignment.updatedAt) }));
        }
        // Migrate logs
        console.log('Migrating logs...');
        for (const log of data.logs) {
            await addDoc(collection(db, 'logs'), Object.assign(Object.assign({}, log), { createdAt: new Date(log.createdAt) }));
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
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.empty;
}
export { migrateToFirebaseImpl as migrateToFirebase };
