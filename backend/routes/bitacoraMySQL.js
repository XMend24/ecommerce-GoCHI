const express = require('express');
const router = express.Router();
const db = require('../server');
const { verificarToken } = require('../middleware/auth'); 

// GET /api/bitacora - Listar movimientos (Solo Admin)
router.get('/', verificarToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere ser administrador.' });
    }

    try {
        const query = `
            SELECT b.id, b.accion, b.descripcion, b.createdAt, u.email 
            FROM bitacoras b
            JOIN usuarios u ON b.usuario_id = u.id
            ORDER BY b.createdAt DESC 
            LIMIT 50`;
            
        const [logs] = await db.query(query);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bitacora - Crear un registro manualmente (Opcional)
router.post('/', verificarToken, async (req, res) => {
    try {
        const { accion, descripcion } = req.body;
        const usuario_id = req.user.id;

        const sql = 'INSERT INTO bitacoras (usuario_id, accion, descripcion) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [usuario_id, accion, descripcion]);
        
        res.json({ message: 'Registro creado', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;