const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "../.env");

dotenv.config({ path: envPath });

console.log("DB CONFIG:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    passwordLoaded: !!process.env.DB_PASSWORD,
});

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = db;