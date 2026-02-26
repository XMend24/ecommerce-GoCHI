//require('dotenv').config();
const mysql = require('mysql2'); 
const express = require('express');
const cors = require('cors');
const app = express();
const carritoRoutes = require('./routes/carritoMySQL');
const pool = mysql.createPool({
host: 'trolley.proxy.rlwy.net', 
user: 'root',
password: 'ZqzjlOoiaeyMxjujIxEaSMnqNeslKlZF',
database: 'railway',
port: 17500, 
ssl: {
rejectUnauthorized: false 
}
}).promise();
// --- 1. Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/api/carrito', carritoRoutes); 

// --- 2. Conexión a Base de Datos ---

const db = require('./config/mysql'); 

// Verificamos la conexión al iniciar (Opcional pero recomendado)
db.query('SELECT 1')
.then(() => console.log('✅ Conectado a MySQL (Pool)'))
.catch(err => console.error('❌ Error conectando a MySQL:', err));

// --- 3. Rutas (Endpoints) ---
// Nota: Les quité el "-mysql" al final para que las URLs sean más limpias
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/carrito', require('./routes/carritoMySQL'));
app.use('/api/pedidos', require('./routes/pedidosMySQL'));
app.use('/api/bitacora', require('./routes/bitacoraMySQL'));

// --- 4. Encender Servidor ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0',() => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});