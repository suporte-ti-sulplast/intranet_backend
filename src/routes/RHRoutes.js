const express = require('express');
const router = express.Router();

const RHController = require('../controllers/RHController');

router.get('/rh-findFilesIn', RHController.findFilesIn); 
router.get('/rh-findFilesOut', RHController.findFilesOut); 
router.post('/rh-convertFile', RHController.convertFile); 
router.get('/rh-listarArquivosPdf', RHController.listarArquivosPdf); 

module.exports = router;