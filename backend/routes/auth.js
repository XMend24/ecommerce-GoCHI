const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../server');
const router = express.Router();
const { registrarAccion } = require('../utils/logger');

// [RF-01] Registro
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email.includes('admin') ? 'admin' : 'usuario';

        // 1. Verificar si ya existe (SQL puro)
        const [existingUser] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email ya registrado' });
        }

        // 2. Crear usuario (SQL puro)
        const sql = 'INSERT INTO usuarios (nombre, email, contraseña_hash, role) VALUES (?, ?, ?, ?)';
        await db.query(sql, [name, email, hashedPassword, role]);

        res.json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [RF-02] Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar en MySQL
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 2. Comparar contraseña (usando el nombre de columna de tu tabla)
        const isMatch = await bcrypt.compare(password, user.contraseña_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        await registrarAccion(user.id, 'LOGIN', 'El usuario inició sesión correctamente');
        // 3. Generar token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            role: user.role, 
            user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [RF-06] Editar perfil
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name } = req.body;

        // Actualizar en MySQL
        await db.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [name, decoded.id]);
        
        res.json({ message: 'Perfil actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;