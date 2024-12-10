"use strict";
const { migrateToFirebase } = require('../lib/migrateToFirebase');
console.log('Starting migration to Firebase...');
migrateToFirebase()
    .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
