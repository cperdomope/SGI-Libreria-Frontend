const express = require('express');
const router = express.Router();
const clienteControlador = require('../controladores/clienteControlador');

// Definición de rutas CRUD para '/api/clientes'

// GET: Obtener todos los clientes
router.get('/', clienteControlador.obtenerClientes);

// GET: Obtener un solo cliente por ID
router.get('/:id', clienteControlador.obtenerClientePorId);

// POST: Crear un nuevo cliente
router.post('/', clienteControlador.crearCliente);

// PUT: Actualizar datos de un cliente
router.put('/:id', clienteControlador.actualizarCliente);

// DELETE: Eliminar un cliente
router.delete('/:id', clienteControlador.eliminarCliente);

module.exports = router;