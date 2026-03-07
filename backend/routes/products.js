const express = require('express');
const db = require('../server'); 
const router = express.Router();
const { verificarToken } = require('../middleware/auth'); 
const { registrarAccion } = require('../utils/logger');

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

// --- OBTENER UN SOLO PRODUCTO POR ID (PÚBLICO O ADMIN) ---
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                id, 
                nombre, 
                precio, 
                descripcion, 
                imagen_url, 
                categoria 
            FROM productos 
            WHERE id = ?`;
            
        const [rows] = await db.query(query, [id]);

        if (rows.length > 0) {
            res.json(rows[0]); 
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products - Crear producto (PROTEGIDO)
router.post('/', verificarToken, esAdmin, async (req, res) => {
    try {
        const { nombre, precio, descripcion, imagen_url, categoria } = req.body;
        
        // Añadimos 'categoria' a la consulta SQL para que no se pierda ese dato
        const sql = 'INSERT INTO productos (nombre, precio, descripcion, imagen_url, categoria) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nombre, precio, descripcion, imagen_url, categoria]);
        await registrarAccion(
            req.user.id, 
            'PRODUCTO CREADO', 
            `Se añadió el producto "${nombre}" con un precio de $${precio}`
        );
        res.json({ message: '✅ Producto creado con éxito', id: result.insertId });
    } catch (error) {
        console.error("Error al subir producto:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- ELIMINAR PRODUCTO ---
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primero obtenemos el nombre para la bitácora antes de borrarlo
        const [producto] = await db.query('SELECT nombre FROM productos WHERE id = ?', [id]);
        
        if (producto.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

        await db.query('DELETE FROM productos WHERE id = ?', [id]);

        // Registro en Bitácora
        await registrarAccion(req.user.id, 'PRODUCTO_ELIMINAR', `Eliminó el producto: ${producto[0].nombre} (ID: ${id})`);

        res.json({ message: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- EDITAR PRODUCTO ---
router.put('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, imagen_url, categoria } = req.body;

        const sql = `UPDATE productos SET nombre=?, precio=?, descripcion=?, imagen_url=?, categoria=? WHERE id=?`;
        await db.query(sql, [nombre, precio, descripcion, imagen_url, categoria, id]);

        await registrarAccion(req.user.id, 'PRODUCTO_EDITAR', `Editó los detalles de: ${nombre}`);

        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;