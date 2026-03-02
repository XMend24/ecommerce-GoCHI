const express = require('express');
const router = express.Router();
const db = require('../server');
const { verificarToken } = require('../middleware/auth');
const { registrarAccion } = require('../utils/logger');

// 1. POST: Agregar un producto al carrito
router.post('/', verificarToken, async (req, res) => {
    try {
        // CAMBIO AQUÍ: Extraemos nombre_producto que viene del frontend (main.js)
        const { producto_id, cantidad, nombre_producto } = req.body;
        const usuario_id = req.user.id; 

        // Buscar si el producto ya está en el carrito
        const [existe] = await db.query(
            'SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?',
            [usuario_id, producto_id]
        );

        if (existe.length > 0) {
            await db.query(
                'UPDATE carrito SET cantidad = cantidad + ? WHERE usuario_id = ? AND producto_id = ?',
                [cantidad, usuario_id, producto_id]
            );
        } else {
            await db.query(
                'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
                [usuario_id, producto_id, cantidad]
            );
        }

        // REGISTRO EN BITÁCORA (Después de definir las variables)
        await registrarAccion(
            usuario_id, 
            'CARRITO_AGREGAR', 
            `El usuario agregó "${nombre_producto || 'Producto ID: ' + producto_id}" al carrito.`
        );

        res.json({ message: "Producto agregado al carrito con éxito" });
    } catch (error) {
        console.error("Error en el backend:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Obtener el carrito (Se mantiene igual)
router.get('/', verificarToken, async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const query = `
            SELECT 
                c.id AS carrito_id, 
                c.cantidad, 
                p.id AS producto_id, 
                p.nombre AS titulo, 
                p.precio, 
                p.imagen_url AS imagen 
            FROM carrito c
            JOIN productos p ON c.producto_id = p.id
            WHERE c.usuario_id = ?`;

        const [items] = await db.query(query, [usuario_id]);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. VACIAR todo el carrito
router.delete('/vaciar/todo', verificarToken, async (req, res) => {
    try {
        const usuario_id = req.user.id; 
        
        const [result] = await db.query(
            'DELETE FROM carrito WHERE usuario_id = ?',
            [usuario_id]
        );

        await registrarAccion(
            usuario_id, 
            'CARRITO_VACIAR', 
            `El usuario vació todo su carrito (${result.affectedRows} productos eliminados).`
        );

        res.json({ message: "Carrito vaciado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. ELIMINAR un producto específico
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const carrito_id = req.params.id;
        const usuario_id = req.user.id;
        // Extraemos el nombre del producto que enviamos desde carrito.js
        const { nombre_producto } = req.body;

        const [result] = await db.query(
            'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
            [carrito_id, usuario_id]
        );

        if (result.affectedRows > 0) {
            await registrarAccion(
                usuario_id, 
                'CARRITO_ELIMINAR', 
                `El usuario eliminó "${nombre_producto || 'ID: ' + carrito_id}" de su carrito.`
            );
            res.json({ message: "Producto eliminado del carrito" });
        } else {
            res.status(404).json({ error: "No se encontró el producto" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;