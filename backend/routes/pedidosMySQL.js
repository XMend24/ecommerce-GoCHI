const express = require('express');
const router = express.Router();
const db = require('../server');
const { verificarToken } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
try {
    const pedido = await Pedido.create({ usuario_id: req.user.id, ...req.body });
    await Bitacora.create({ usuario_id: req.user.id, accion: 'CREATE_ORDER', descripcion: `Pedido ID ${pedido.id} creado` });
    res.json(pedido);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.get('/', auth, async (req, res) => {
try {
    const pedidos = await Pedido.findAll({ where: { usuario_id: req.user.id } });
    res.json(pedidos);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.put('/:id', auth, async (req, res) => {
try {
    const [updated] = await Pedido.update(req.body, { where: { id: req.params.id, usuario_id: req.user.id } });
    if (updated) {
    await Bitacora.create({ usuario_id: req.user.id, accion: 'UPDATE_ORDER', descripcion: `Pedido ID ${req.params.id} actualizado` });
    res.json({ message: 'Actualizado' });
    } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
    }
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.delete('/:id', auth, async (req, res) => {
try {
    const deleted = await Pedido.destroy({ where: { id: req.params.id, usuario_id: req.user.id } });
    if (deleted) {
    await Bitacora.create({ usuario_id: req.user.id, accion: 'DELETE_ORDER', descripcion: `Pedido ID ${req.params.id} eliminado` });
    res.json({ message: 'Eliminado' });
    } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
    }
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

module.exports = router;