const express = require('express');
const router = express.Router();
const db = require('../server');
const { verificarToken } = require('../middleware/auth'); 

router.get('/', auth, async (req, res) => {
if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
try {
    const logs = await Bitacora.findAll({ order: [['createdAt', 'DESC']] });
    res.json(logs);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.post('/', auth, async (req, res) => {
try {
    const log = await Bitacora.create({ usuario_id: req.user.id, ...req.body });
    res.json(log);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

module.exports = router;