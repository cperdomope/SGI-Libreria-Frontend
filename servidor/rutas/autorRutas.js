const express = require('express');
const router = express.Router();
const autorControlador = require('../controladores/autorControlador');
const verificarToken = require('../middlewares/verificarToken');
const { soloAdministrador, administradorOVendedor } = require('../middlewares/verificarRol');

// GET: Vendedores pueden ver autores para información
router.get('/', verificarToken, administradorOVendedor, autorControlador.obtenerAutores);

// POST/PUT/DELETE: Solo Administradores
router.post('/', verificarToken, soloAdministrador, autorControlador.crearAutor);
router.put('/:id', verificarToken, soloAdministrador, autorControlador.actualizarAutor);
router.delete('/:id', verificarToken, soloAdministrador, autorControlador.eliminarAutor);

module.exports = router;
