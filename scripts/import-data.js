const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCT3jtF3V7BY-wae-lLJwVko3lk93hqi-U',
  authDomain: 'filmbrand-51c9c.firebaseapp.com',
  projectId: 'filmbrand-51c9c',
  databaseURL: 'https://filmbrand-51c9c-default-rtdb.europe-west1.firebasedatabase.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// The organization ID of the current admin
const ORGANIZATION_ID = 'Z1hx02w0nbXDLxZWijmYFEtb69G3'; // Current admin's organization ID

async function importData() {
  try {
    // Read the import file
    const importPath = path.join(__dirname, '..', 'data', 'import.json');
    const rawData = fs.readFileSync(importPath, 'utf8');
    const data = JSON.parse(rawData);

    if (!data.arbeitsplan_db) {
      throw new Error('Invalid data format: Missing arbeitsplan_db');
    }

    const now = new Date().toISOString();

    // Import employees
    console.log('Importing employees...');
    const employeeRefs = {};
    for (const employee of data.arbeitsplan_db.employees) {
      const docRef = await addDoc(collection(db, 'mitarbeiter'), { 
        ...employee,
        organizationId: ORGANIZATION_ID,
        createdAt: now,
        updatedAt: now
      });
      employeeRefs[employee.id] = docRef.id;
    }
    console.log(`Imported ${data.arbeitsplan_db.employees.length} employees`);

    // Import stores
    console.log('Importing stores...');
    const storeRefs = {};
    for (const store of data.arbeitsplan_db.stores) {
      const docRef = await addDoc(collection(db, 'filialen'), { 
        ...store,
        organizationId: ORGANIZATION_ID,
        createdAt: now,
        updatedAt: now
      });
      storeRefs[store.id] = docRef.id;
    }
    console.log(`Imported ${data.arbeitsplan_db.stores.length} stores`);

    // Import working shifts
    console.log('Importing working shifts...');
    const shiftRefs = {};
    for (const shift of data.arbeitsplan_db.workingShifts) {
      const { id, ...shiftData } = shift; // Remove the old ID
      const docRef = await addDoc(collection(db, 'arbeitsschichten'), {
        ...shiftData,
        organizationId: ORGANIZATION_ID,
        createdAt: now,
        updatedAt: now
      });
      shiftRefs[id] = docRef.id;
    }
    console.log(`Imported ${data.arbeitsplan_db.workingShifts.length} working shifts`);

    // Import assignments as shifts
    console.log('Importing assignments as shifts...');
    for (const assignment of data.arbeitsplan_db.assignments) {
      const { id, employeeId, storeId, shiftId, ...assignmentData } = assignment;
      
      // Get the new IDs from our reference maps
      const newEmployeeId = employeeRefs[employeeId];
      const newStoreId = storeRefs[storeId];
      const newShiftId = shiftRefs[shiftId];

      // Skip if we can't find the referenced entities
      if (!newEmployeeId || !newStoreId || !newShiftId) {
        console.warn('Skipping assignment due to missing references:', {
          originalIds: { employeeId, storeId, shiftId },
          newIds: { newEmployeeId, newStoreId, newShiftId }
        });
        continue;
      }

      await addDoc(collection(db, 'shifts'), {
        ...assignmentData,
        employeeId: newEmployeeId,
        storeId: newStoreId,
        shiftId: newShiftId,
        organizationId: ORGANIZATION_ID,
        createdAt: now,
        updatedAt: now
      });
    }
    console.log(`Imported ${data.arbeitsplan_db.assignments.length} assignments as shifts`);

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

// Run the import
importData();
