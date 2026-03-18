const express = require('express');
const db = require('../server'); 
const router = express.Router();
const path = require('path'); 
const multer = require('multer'); 
const axios = require('axios'); 
const FormData = require('form-data'); 
const { verificarToken } = require('../middleware/auth'); 
const { registrarAccion } = require('../utils/logger');

// --- 1. CONFIGURACIÓN DE ALMACENAMIENTO EN MEMORIA ---
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten archivos de imagen (jpg, jpeg, png)"));
    }
});

// --- MIDDLEWARE PARA VALIDAR SI ES ADMIN ---
const esAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Acceso denegado. Se requiere ser administrador." });
    }
};

// GET /api/products - Listar productos (PÚBLICO)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 12; 
        const offset = (page - 1) * limit;
        const categoria = req.query.categoria;

        let query = `SELECT id, nombre AS titulo, precio, descripcion, imagen_url AS imagen, categoria FROM productos`;
        let countQuery = `SELECT COUNT(*) as total FROM productos`;
        const params = [];

        if (categoria && categoria !== 'Todos') {
            query += ` WHERE categoria = ?`;
            countQuery += ` WHERE categoria = ?`;
            params.push(categoria);
        }

        query += ` LIMIT ? OFFSET ?`;
        
        const [products] = await db.query(query, [...params, limit, offset]);
        const [totalRows] = await db.query(countQuery, params);

        const totalPages = Math.ceil(totalRows[0].total / limit);

        res.json({
            products,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `SELECT id, nombre, precio, descripcion, imagen_url, categoria FROM productos WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        if (rows.length > 0) res.json(rows[0]); 
        else res.status(404).json({ error: "Producto no encontrado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products - Crear producto en IMGBB
router.post('/', verificarToken, esAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, precio, descripcion, categoria } = req.body;
        let imagen_url = null;

        // 1. Si hay archivo, lo enviamos a ImgBB
        if (req.file) {
            const imageBase64 = req.file.buffer.toString('base64');
            const form = new FormData();
            form.append('image', imageBase64);

            const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
                headers: form.getHeaders()
            });
            imagen_url = response.data.data.url; // Rescatamos el link permanente
        }

        // 2. Guardamos en MySQL usando la URL de ImgBB
        const sql = 'INSERT INTO productos (nombre, precio, descripcion, imagen_url, categoria) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nombre, precio, descripcion, imagen_url, categoria]);

        await registrarAccion(req.user.id, 'PRODUCTO CREADO', `Se añadió el producto "${nombre}"`);
        res.json({ message: '✅ Producto creado con éxito', id: result.insertId, url: imagen_url });
    } catch (error) {
        console.error("Error al subir imagen:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/products/:id - Editar producto en IMGBB
router.put('/:id', verificarToken, esAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, categoria } = req.body;
        
        const [actual] = await db.query('SELECT imagen_url FROM productos WHERE id = ?', [id]);
        if (actual.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

        let nuevaImagen = actual[0].imagen_url;

        // Si subió archivo nuevo, repetimos el proceso de ImgBB
        if (req.file) {
            const imageBase64 = req.file.buffer.toString('base64');
            const form = new FormData();
            form.append('image', imageBase64);

            const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
                headers: form.getHeaders()
            });
            nuevaImagen = response.data.data.url;
        }

        const sql = `UPDATE productos SET nombre=?, precio=?, descripcion=?, imagen_url=?, categoria=? WHERE id=?`;
        await db.query(sql, [nombre, precio, descripcion, nuevaImagen, categoria, id]);

        await registrarAccion(req.user.id, 'PRODUCTO_EDITAR', `Editó: ${nombre}`);
        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar imagen:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [producto] = await db.query('SELECT nombre FROM productos WHERE id = ?', [id]);
        if (producto.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
        await db.query('DELETE FROM productos WHERE id = ?', [id]);
        await registrarAccion(req.user.id, 'PRODUCTO_ELIMINAR', `Eliminó: ${producto[0].nombre}`);
        res.json({ message: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;