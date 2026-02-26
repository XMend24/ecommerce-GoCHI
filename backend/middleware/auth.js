const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.substring(7);  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'un_mamut_chiquitito_queria_volar_pero_no_pudo_y_se_murio_cayendo_de_un_5to_piso');
    req.user = decoded;  // Agrega { id, rol, etc. } a req
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};