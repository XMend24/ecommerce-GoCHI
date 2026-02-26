// require('dotenv').config(); // Comentado por ahora como pediste
const mysql = require('mysql2'); 
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
// --- 1. Conexión a Base de Datos (UNIFICADA) ---
// Usamos la URL completa que es el método más seguro
const pool = mysql.createPool({
    uri: 'mysql://root:ZqzjlOoiaeyMxjujIxEaSMnqNeslKlZF@trolley.proxy.rlwy.net:17500/railway',
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Prueba de conexión inmediata con log detallado
pool.query('SELECT 1')
    .then(() => console.log('✅ ¡CONEXIÓN EXITOSA CON RAILWAY!'))
    .catch(err => console.error('❌ Error detallado de conexión:', err.code, err.message));

// Exportamos el pool para que tus rutas lo usen si lo necesitan
// Nota: Si tus archivos en ./routes/ usan 'require(../config/mysql)', 
// deberías editar ese archivo también con estos mismos datos.
module.exports = pool; 

// --- 2. Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// --- 3. Rutas (Endpoints) ---

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/carrito', require('./routes/carritoMySQL'));
app.use('/api/pedidos', require('./routes/pedidosMySQL'));
app.use('/api/bitacora', require('./routes/bitacoraMySQL'));

// --- 4. Encender Servidor ---
// Render usa el puerto 10000 por defecto
const PORT = process.env.PORT || 10000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🚀 Intentando conectar a Railway en trolley.proxy.rlwy.net:17500...`);
});