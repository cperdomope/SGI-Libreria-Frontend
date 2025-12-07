const express = require('express');
const router = express.Router();
const autorControlador = require('../controladores/autorControlador');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', verificarToken, autorControlador.obtenerAutores);
router.post('/', verificarToken, autorControlador.crearAutor);
router.put('/:id', verificarToken, autorControlador.actualizarAutor);
router.delete('/:id', verificarToken, autorControlador.eliminarAutor);

module.exports = router;
