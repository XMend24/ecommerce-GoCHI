const db = require('../server'); // Importa el pool de conexiones

const registrarAccion = async (usuario_id, accion, descripcion) => {
    try {
        const sql = 'INSERT INTO bitacoras (usuario_id, accion, descripcion) VALUES (?, ?, ?)';
        await db.query(sql, [usuario_id, accion, descripcion]);
        console.log(`Log registrado: ${accion}`);
    } catch (error) {
        console.error("❌ Error al insertar en bitácora:", error);
    }
};

module.exports = { registrarAccion };