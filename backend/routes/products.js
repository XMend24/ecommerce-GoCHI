const express = require('express');
const db = require('../server');
const router = express.Router();
const query = 'SELECT id, nombre AS titulo, precio, descripcion, imagen_url AS imagen, categoria FROM productos';
// GET /api/products - Listar productos con ALIAS para el Frontend
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

// POST /api/products - Crear producto
router.post('/', async (req, res) => {
    try {
        const { nombre, precio, descripcion, imagen_url } = req.body;
        const sql = 'INSERT INTO productos (nombre, precio, descripcion, imagen_url) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [nombre, precio, descripcion, imagen_url]);
        res.json({ message: 'Producto creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;