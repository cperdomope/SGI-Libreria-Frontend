const express = require('express');
const router = express.Router();
const proveedorControlador = require('../controladores/proveedorControlador');
const verificarToken = require('../middlewares/verificarToken');

// GET: Obtener todos los proveedores
router.get('/', verificarToken, proveedorControlador.obtenerProveedores);

// POST: Crear nuevo proveedor
router.post('/', verificarToken, proveedorControlador.crearProveedor);

// PUT: Actualizar proveedor
router.put('/:id', verificarToken, proveedorControlador.actualizarProveedor);

// DELETE: Eliminar proveedor
router.delete('/:id', verificarToken, proveedorControlador.eliminarProveedor);

module.exports = router;
