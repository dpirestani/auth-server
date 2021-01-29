const express = require('express');
const validate = require('../../middlewares/validate');
const customValidationValidation = require('../../validations/custom.validation');
const interpreterController = require('../../controllers/interpreter.controller');

const router = express.Router();

router.post('/register', interpreterController.createInterpreter);
router.get('/getInterpreters', interpreterController.getInterpreters);
router.get('/getInterpreter', interpreterController.getInterpreter);
router.get('/updateInterpreter', interpreterController.updateInterpreter);
router.get('/deleteInterpreter', interpreterController.deleteInterpreter);

module.exports = router;