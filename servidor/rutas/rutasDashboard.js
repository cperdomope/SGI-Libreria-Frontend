const express = require('express');
const router = express.Router();
const controladorDashboard = require('../controladores/controladorDashboard');

// Ruta GET: http://localhost:3000/api/dashboard
router.get('/', controladorDashboard.obtenerEstadisticas);

module.exports = router;