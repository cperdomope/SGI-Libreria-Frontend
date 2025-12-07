const express = require('express');
const router = express.Router();
const controladorLibros = require('../controladores/controladorLibros');
const verificarToken = require('../middlewares/verificarToken');

// 1. Obtener todos (GET)
router.get('/', verificarToken, controladorLibros.obtenerLibros);

// 2. Crear nuevo (POST)
router.post('/', verificarToken, controladorLibros.crearLibro);

// 3. Editar existente (PUT) <--- ESTA ES LA QUE TE FALTABA O FALLABA
router.put('/:id', verificarToken, controladorLibros.actualizarLibro);

// 4. Eliminar (DELETE)
router.delete('/:id', verificarToken, controladorLibros.eliminarLibro);

module.exports = router;