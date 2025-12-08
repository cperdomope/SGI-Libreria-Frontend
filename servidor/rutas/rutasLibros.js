const express = require('express');
const router = express.Router();
const controladorLibros = require('../controladores/controladorLibros');
const verificarToken = require('../middlewares/verificarToken');
const { soloAdministrador, administradorOVendedor } = require('../middlewares/verificarRol');

// 1. Obtener todos (GET) - Vendedores necesitan ver inventario para ventas
router.get('/', verificarToken, administradorOVendedor, controladorLibros.obtenerLibros);

// 2. Crear nuevo (POST) - Solo Administradores
router.post('/', verificarToken, soloAdministrador, controladorLibros.crearLibro);

// 3. Editar existente (PUT) - Solo Administradores
router.put('/:id', verificarToken, soloAdministrador, controladorLibros.actualizarLibro);

// 4. Eliminar (DELETE) - Solo Administradores
router.delete('/:id', verificarToken, soloAdministrador, controladorLibros.eliminarLibro);

module.exports = router;
