const express = require('express');
const router = express.Router();
const controladorMovimientos = require('../controladores/controladorMovimientos');
const verificarToken = require('../middlewares/verificarToken');

// Ruta POST: Para enviar datos nuevos (registrar una compra o venta)
// La URL será: http://localhost:3000/api/movimientos
router.post('/', verificarToken, controladorMovimientos.registrarMovimiento);

module.exports = router;