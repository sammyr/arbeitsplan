var migrateToFirebase = require('../lib/migrateToFirebase').migrateToFirebase;
console.log('Starting migration to Firebase...');
migrateToFirebase()
    .then(function () {
    console.log('Migration completed successfully!');
    process.exit(0);
})
    .catch(function (error) {
    console.error('Migration failed:', error);
    process.exit(1);
});
