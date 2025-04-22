# Combinations API

A Node.js Express API that generates combinations of items from an input array of numbers, where each number specifies how many items to create with a unique prefix (e.g., `[1, 2, 1]` → `["A1", "B1", "B2", "C1"]`). The application uses MySQL as a database to store items and combinations, with a dynamic prefix generator for scalability. Ideal for inventory management, logistics, event planning, and combinatorial testing.


## Features
- **Dynamic Prefixes**: Generates unique prefixes (A, B, ..., Z, AA, AB, ...) for items, supporting large inputs (e.g., 30 `1`s → `A1` to `AD1`).
- **Combination Generation**: Creates combinations of specified length (e.g., pairs for `length: 2`).
- **MySQL Database Integration**: Stores items and combinations with transaction support.
- **Environment Variables**: Configures database via `.env` (e.g., `DB_NAME`).

## Installation
1. **Clone the Repository**:
   git clone
   cd combinations-api

2. **Install Dependencies**:
   npm install
   - Installs `express`, `mysql2`, and `dotenv`.

## Configuration
**Create `.env` File**:
   In the project root, create `.env`:
   ```env
   DB_NAME=combinations_db
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_PORT=3306
   ```
   - Replace `your_username` and `your_password` with your MySQL credentials.

## Running the Application
**Start the Server**:
   npm start
   - Runs on `http://localhost:3000`.