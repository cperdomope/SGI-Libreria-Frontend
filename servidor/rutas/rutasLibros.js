const express = require('express');
const router = express.Router();
const controladorLibros = require('../controladores/controladorLibros');

// 1. Obtener todos (GET)
router.get('/', controladorLibros.obtenerLibros);

// 2. Crear nuevo (POST)
router.post('/', controladorLibros.crearLibro);

// 3. Editar existente (PUT) <--- ESTA ES LA QUE TE FALTABA O FALLABA
router.put('/:id', controladorLibros.actualizarLibro);

// 4. Eliminar (DELETE)
router.delete('/:id', controladorLibros.eliminarLibro);

module.exports = router;