const express = require('express');
const router = express.Router();
const controladorDashboard = require('../controladores/controladorDashboard');
const verificarToken = require('../middlewares/verificarToken');

// Ruta GET: http://localhost:3000/api/dashboard
router.get('/', verificarToken, controladorDashboard.obtenerEstadisticas);

module.exports = router;