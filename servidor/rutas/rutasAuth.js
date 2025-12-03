const express = require('express');
const router = express.Router();
const controladorAuth = require('../controladores/controladorAuth');

// POST: http://localhost:3000/api/auth/login
router.post('/login', controladorAuth.login);

module.exports = router;