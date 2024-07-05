const express = require('express');
const router = express.Router();

const LogController = require('../controllers/LogsController');

router.get('/log-alteracao-senha', LogController.alteracaoSenha);
router.get('/log-acessos', LogController.acessos);

module.exports = router;