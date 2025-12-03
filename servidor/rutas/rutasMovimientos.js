const express = require('express');
const router = express.Router();
const controladorMovimientos = require('../controladores/controladorMovimientos');

// Ruta POST: Para enviar datos nuevos (registrar una compra o venta)
// La URL será: http://localhost:3000/api/movimientos
router.post('/', controladorMovimientos.registrarMovimiento);

module.exports = router;