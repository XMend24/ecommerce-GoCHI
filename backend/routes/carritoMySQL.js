const express = require('express');
const router = express.Router();
const db = require('../server');
const { verificarToken } = require('../middleware/auth');

// 1. POST: Agregar un producto al carrito
router.post('/', verificarToken, async (req, res) => {
    try {
        const { producto_id, cantidad } = req.body;
        const usuario_id = req.user.id; // Viene del token

        // Buscar si el producto ya está en el carrito de este usuario
        const [existe] = await db.query(
            'SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?',
            [usuario_id, producto_id]
        );

        if (existe.length > 0) {
            // Si ya existe, sumamos la cantidad
            await db.query(
                'UPDATE carrito SET cantidad = cantidad + ? WHERE usuario_id = ? AND producto_id = ?',
                [cantidad, usuario_id, producto_id]
            );
        } else {
            // Si no existe, lo insertamos como nuevo
            await db.query(
                'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
                [usuario_id, producto_id, cantidad]
            );
        }

        res.json({ message: "Producto agregado al carrito con éxito" });
    } catch (error) {
        // AQUÍ es donde se estaba enviando el error al frontend
        console.error("Error en el backend:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Obtener el carrito del usuario
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

// VACIAR todo el carrito del usuario
router.delete('/vaciar/todo', verificarToken, async (req, res) => {
    try {
        const usuario_id = req.user.id; 

        const [result] = await db.query(
            'DELETE FROM carrito WHERE usuario_id = ?',
            [usuario_id]
        );

        res.json({ message: "Carrito vaciado correctamente", deletedRows: result.affectedRows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ELIMINAR un producto específico del carrito
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const carrito_id = req.params.id;
        const usuario_id = req.user.id; // Seguridad: Solo el dueño puede borrarlo

        const [result] = await db.query(
            'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
            [carrito_id, usuario_id]
        );

        if (result.affectedRows > 0) {
            res.json({ message: "Producto eliminado del carrito" });
        } else {
            res.status(404).json({ error: "No se encontró el producto en tu carrito" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;