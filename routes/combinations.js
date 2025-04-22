const express = require('express');
const pool = require('../db');
const { generateCombinations } = require('../utils');

const router = express.Router();

// Counter to ensure unique combination_id
let requestCounter = 0;

// Function to convert index to prefix (A, B, C, ..., Z, AA, AB, ...)
function indexToPrefix(index) {
    let letters = '';
    let base = index;
    do {
        let remainder = base % 26;
        letters = String.fromCharCode(65 + remainder) + letters;
        base = Math.floor(base / 26) - 1;
    } while (base >= 0);
    return letters;
}

router.post('/generate', async (req, res) => {
    const { items: inputItems, length } = req.body;

    // Input validation
    if (!Array.isArray(inputItems) || !Number.isInteger(length) || length < 1) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    if (inputItems.length > 1000) {
        return res.status(400).json({ error: 'Input array too large' });
    }
    for (const num of inputItems) {
        if (!Number.isInteger(num) || num < 1) {
            return res.status(400).json({ error: `Invalid item number: ${num}` });
        }
    }

    let connection;
    try {
        connection = await pool.getConnection();
        console.log(`Using database: ${process.env.DB_NAME}`);
        await connection.query('USE ??', [process.env.DB_NAME]);
        await connection.beginTransaction();
        console.log('Transaction started');

        // Convert input numbers to item names
        const itemNames = [];
        let prefixIndex = 0;
        for (const num of inputItems) {
            const prefix = indexToPrefix(prefixIndex);
            prefixIndex++;
            for (let i = 1; i <= num; i++) {
                const itemName = `${prefix}${i}`;
                if (itemName.length > 10) {
                    throw new Error(`Item name too long: ${itemName}`);
                }
                itemNames.push(itemName);
            }
        }

        console.log('Generated item names:', itemNames);

        // Insert items into database if not exists
        for (const itemName of itemNames) {
            await connection.query(`
                INSERT IGNORE INTO items (item_name)
                VALUES (?)
            `, [itemName]);
        }

        console.log('Items inserted into database');

        // Generate combinations
        const combinations = generateCombinations(itemNames, length);

        console.log('Generated combinations:', combinations);

        if (combinations.length === 0) {
            console.log('No valid combinations generated');
            const [responseResult] = await connection.query(`
                INSERT INTO responses (combinations, created_at)
                VALUES (?, NOW())
            `, [JSON.stringify([])]);
            await connection.commit();
            console.log('Transaction committed (empty combinations)');
            return res.json({
                id: responseResult.insertId,
                combination: []
            });
        }

        // Generate a unique base combination_id
        requestCounter = (requestCounter + 1) % 1000;
        const baseCombinationId = BigInt(Date.now()) * 1000n + BigInt(requestCounter);

        // Store combinations in combinations table
        const combinationIds = [];
        for (let i = 0; i < combinations.length; i++) {
            const combinationId = baseCombinationId + BigInt(i);
            await connection.query(`
                INSERT INTO combinations (combination_id, combination)
                VALUES (?, ?)
            `, [combinationId.toString(), JSON.stringify(combinations[i])]);
            combinationIds.push(combinationId);
        }
        // Store response in responses table
        const [responseResult] = await connection.query(`
            INSERT INTO responses (combinations, created_at)
            VALUES (?, NOW())
        `, [JSON.stringify(combinations)]);

        await connection.commit();
        console.log('Transaction committed');

        res.json({
            id: responseResult.insertId,
            combination: combinations
        });

    } catch (error) {
        console.error('Detailed error:', error.stack);
        if (connection) {
            await connection.rollback();
            console.log('Transaction rolled back');
        }
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            connection.release();
            console.log('Database connection released');
        }
    }
});

module.exports = router;