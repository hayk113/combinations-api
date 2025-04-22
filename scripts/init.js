// runs the initialization
const initializeDatabase = require('../initDb');

initializeDatabase()
    .then(() => {
        console.log('Database setup complete');
        process.exit(0);
    })
    .catch(err => {
        console.error('Database setup failed:', err);
        process.exit(1);
    });