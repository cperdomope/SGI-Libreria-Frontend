const express = require('express');
const router = express.Router();
const clienteControlador = require('../controladores/clienteControlador');
const verificarToken = require('../middlewares/verificarToken');

// Definición de rutas CRUD para '/api/clientes'

// GET: Obtener todos los clientes
router.get('/', verificarToken, clienteControlador.obtenerClientes);

// GET: Obtener un solo cliente por ID
router.get('/:id', verificarToken, clienteControlador.obtenerClientePorId);

// POST: Crear un nuevo cliente
router.post('/', verificarToken, clienteControlador.crearCliente);

// PUT: Actualizar datos de un cliente
router.put('/:id', verificarToken, clienteControlador.actualizarCliente);

// DELETE: Eliminar un cliente
router.delete('/:id', verificarToken, clienteControlador.eliminarCliente);

module.exports = router;