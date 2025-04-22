require('dotenv').config();
const pool = require('./db');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    let connection;
    let isPoolConnection = false;
    try {
        // Validate environment variables
        const dbName = process.env.DB_NAME || 'combinations_db';
        if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
            throw new Error('DB_USER or DB_PASSWORD is not defined in .env file');
        }
        console.log(`Environment variables - DB_NAME: ${dbName}, DB_HOST: ${process.env.DB_HOST || 'localhost'}, DB_PORT: ${process.env.DB_PORT || 3306}`);

        // Try pool connection first
        try {
            connection = await pool.getConnection();
            isPoolConnection = true;
            console.log('Connected to MySQL server via pool');
        } catch (poolError) {
            if (poolError.code === 'ER_BAD_DB_ERROR') {
                connection = await mysql.createConnection({
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    port: process.env.DB_PORT || 3306
                });
                console.log('Connected to MySQL server directly');
            } else {
                throw poolError;
            }
        }

        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [dbName]);
        console.log(`Database ${dbName} created or already exists`);

        // Select database
        await connection.query('USE ??', [dbName]);
        console.log(`Using database: ${dbName}`);

        // Create tables individually
        await connection.query(`
            CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_name VARCHAR(10) NOT NULL,
                UNIQUE(item_name)
            )
        `);
        console.log('Items table created or already exists');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS responses (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                combinations LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log('Responses table created or already exists');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS combinations (
                combination_id VARCHAR(255) PRIMARY KEY,
                combination LONGTEXT
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log('Combinations table created or already exists');

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        throw error;
    } finally {
        if (connection) {
            if (isPoolConnection) {
                connection.release();
                console.log('Pool connection released');
            } else {
                await connection.end();
                console.log('Direct connection closed');
            }
        }
    }
}

module.exports = initializeDatabase;