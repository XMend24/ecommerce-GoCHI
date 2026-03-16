const express = require('express');
const db = require('../server'); 
const router = express.Router();
const path = require('path'); 
const multer = require('multer'); 
const { verificarToken } = require('../middleware/auth'); 
const { registrarAccion } = require('../utils/logger');

// --- 1. CONFIGURACIÓN DE ALMACENAMIENTO (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Las fotos se guardarán en public/uploads/
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Nombre único: Marca de tiempo + extensión original (ej: 171583000.jpg)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Validamos que sea solo imagen
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
        const query = `
            SELECT id, nombre AS titulo, precio, descripcion, imagen_url AS imagen, categoria
            FROM productos`;
        const [products] = await db.query(query);
        res.json(products);
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

// POST /api/products - Crear producto con IMAGEN FÍSICA
// Añadimos 'upload.single('imagen')' para procesar el archivo del FormData
router.post('/', verificarToken, esAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, precio, descripcion, categoria } = req.body;
        
        // Si se subió un archivo, guardamos la ruta. Si no, queda vacío.
        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

        const sql = 'INSERT INTO productos (nombre, precio, descripcion, imagen_url, categoria) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nombre, precio, descripcion, imagen_url, categoria]);

        await registrarAccion(req.user.id, 'PRODUCTO CREADO', `Se añadió el producto "${nombre}"`);
        res.json({ message: '✅ Producto creado con éxito', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/products/:id - Editar producto (Opcional subir nueva imagen)
router.put('/:id', verificarToken, esAdmin, upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, categoria } = req.body;
        
        // 1. Buscamos el producto actual para no perder la imagen anterior si no se sube una nueva
        const [actual] = await db.query('SELECT imagen_url FROM productos WHERE id = ?', [id]);
        if (actual.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

        // 2. Si el usuario subió una imagen nueva, usamos esa. Si no, mantenemos la vieja.
        const nuevaImagen = req.file ? `/uploads/${req.file.filename}` : actual[0].imagen_url;

        const sql = `UPDATE productos SET nombre=?, precio=?, descripcion=?, imagen_url=?, categoria=? WHERE id=?`;
        await db.query(sql, [nombre, precio, descripcion, nuevaImagen, categoria, id]);

        await registrarAccion(req.user.id, 'PRODUCTO_EDITAR', `Editó: ${nombre}`);
        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
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