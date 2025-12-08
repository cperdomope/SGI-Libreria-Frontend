const express = require('express');
const router = express.Router();
const clienteControlador = require('../controladores/clienteControlador');
const verificarToken = require('../middlewares/verificarToken');
const { soloAdministrador, administradorOVendedor } = require('../middlewares/verificarRol');

// Definición de rutas CRUD para '/api/clientes'

// GET: Obtener todos los clientes - Vendedores necesitan ver clientes para ventas
router.get('/', verificarToken, administradorOVendedor, clienteControlador.obtenerClientes);

// GET: Obtener un solo cliente por ID - Vendedores necesitan consultar clientes
router.get('/:id', verificarToken, administradorOVendedor, clienteControlador.obtenerClientePorId);

// POST: Crear un nuevo cliente - Vendedores pueden registrar nuevos clientes
router.post('/', verificarToken, administradorOVendedor, clienteControlador.crearCliente);

// PUT: Actualizar datos de un cliente - Solo Administradores
router.put('/:id', verificarToken, soloAdministrador, clienteControlador.actualizarCliente);

// DELETE: Eliminar un cliente - Solo Administradores
router.delete('/:id', verificarToken, soloAdministrador, clienteControlador.eliminarCliente);

module.exports = router;