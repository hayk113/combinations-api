const express = require('express');
const initializeDatabase = require('./initDb');
const combinationsRouter = require('./routes/combinations');

const app = express();

app.use(express.json());

// Initialize database
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// Routes
app.use('/api', combinationsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});