const express = require('express');
const router = express.Router();
const controladorLibros = require('../controladores/controladorLibros');
const verificarToken = require('../middlewares/verificarToken');
const { soloAdministrador, administradorOVendedor } = require('../middlewares/verificarRol');
const { validarId } = require('../middlewares/validarParametroId');

// 1. Obtener todos (GET) - Vendedores necesitan ver inventario para ventas
router.get('/', verificarToken, administradorOVendedor, controladorLibros.obtenerLibros);

// 2. Crear nuevo (POST) - Solo Administradores
router.post('/', verificarToken, soloAdministrador, controladorLibros.crearLibro);

// 3. Editar existente (PUT) - Solo Administradores
// validarId valida que :id sea un número positivo válido
router.put('/:id', verificarToken, soloAdministrador, validarId('libro'), controladorLibros.actualizarLibro);

// 4. Eliminar (DELETE) - Solo Administradores
// validarId valida que :id sea un número positivo válido
router.delete('/:id', verificarToken, soloAdministrador, validarId('libro'), controladorLibros.eliminarLibro);

module.exports = router;
