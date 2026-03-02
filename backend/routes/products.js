const express = require('express');
const db = require('../server'); 
const router = express.Router();
const { verificarToken } = require('../middleware/auth'); 

// --- MIDDLEWARE PARA VALIDAR SI ES ADMIN ---
const esAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Es admin, puede pasar
    } else {
        res.status(403).json({ error: "Acceso denegado. Se requiere ser administrador." });
    }
};

// GET /api/products - Listar productos (PÚBLICO)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                nombre AS titulo, 
                precio, 
                descripcion,
                imagen_url AS imagen,
                categoria
            FROM productos`;
            
        const [products] = await db.query(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products - Crear producto (PROTEGIDO)
// Agregamos 'verificarToken' para saber quién es, y 'esAdmin' para ver si tiene permiso
router.post('/', verificarToken, esAdmin, async (req, res) => {
    try {
        const { nombre, precio, descripcion, imagen_url, categoria } = req.body;
        
        // Añadimos 'categoria' a la consulta SQL para que no se pierda ese dato
        const sql = 'INSERT INTO productos (nombre, precio, descripcion, imagen_url, categoria) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nombre, precio, descripcion, imagen_url, categoria]);
        
        res.json({ message: '✅ Producto creado con éxito', id: result.insertId });
    } catch (error) {
        console.error("Error al subir producto:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;