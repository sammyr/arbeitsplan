"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrateToFirebase_1 = require("../lib/migrateToFirebase");
console.log('Starting migration to Firebase...');
(0, migrateToFirebase_1.migrateToFirebase)()
    .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
