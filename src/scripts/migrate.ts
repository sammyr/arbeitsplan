import { migrateToFirebase } from '../lib/migrateToFirebase.js';

console.log('Starting migration to Firebase...');
migrateToFirebase()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
