const express = require('express');
const router = express.Router();
const categoriaControlador = require('../controladores/categoriaControlador');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', verificarToken, categoriaControlador.obtenerCategorias);
router.post('/', verificarToken, categoriaControlador.crearCategoria);
router.put('/:id', verificarToken, categoriaControlador.actualizarCategoria);
router.delete('/:id', verificarToken, categoriaControlador.eliminarCategoria);

module.exports = router;
