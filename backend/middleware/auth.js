const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtiene el token del "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'un_mamut_chiquitito_queria_volar_pero_no_pudo_y_se_murio_cayendo_de_un_5to_piso');
        req.user = verificado; // Aquí se guarda el id y el role del usuario
        next();
    } catch (error) {
        res.status(400).json({ error: "Token no válido." });
    }
};

module.exports = { verificarToken };