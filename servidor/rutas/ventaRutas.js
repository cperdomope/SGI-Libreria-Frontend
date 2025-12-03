const express = require('express');
const router = express.Router();
const ventaControlador = require('../controladores/ventaControlador');

// POST: Crear venta (Proceso transaccional)
router.post('/', ventaControlador.crearVenta);

// GET: Listar ventas
router.get('/', ventaControlador.obtenerVentas);

module.exports = router;