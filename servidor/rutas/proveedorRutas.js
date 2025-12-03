const express = require('express');
const router = express.Router();
const proveedorControlador = require('../controladores/proveedorControlador');

// GET: Obtener todos los proveedores
router.get('/', proveedorControlador.obtenerProveedores);

// POST: Crear nuevo proveedor
router.post('/', proveedorControlador.crearProveedor);

// PUT: Actualizar proveedor
router.put('/:id', proveedorControlador.actualizarProveedor);

// DELETE: Eliminar proveedor
router.delete('/:id', proveedorControlador.eliminarProveedor);

module.exports = router;
