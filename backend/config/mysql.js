const mysql = require('mysql2');

const pool = mysql.createPool({
host: process.env.DB_HOST || 'localhost',
user: process.env.DB_USER || 'root',
password: process.env.DB_PASSWORD || '',
database: process.env.DB_NAME || 'ecommerce_db',
waitForConnections: true,
connectionLimit: 10
});

module.exports = pool.promise(); // Exportamos la versión con promesas