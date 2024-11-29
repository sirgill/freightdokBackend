const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const operatorCosts = require('../../controllers/ownerOperatorServiceCosts')

router.post('/', auth, operatorCosts.createCost)
router.post('/createAdditionalCosts', auth, operatorCosts.createAdditionalCosts)

router.get('/', auth, operatorCosts.getAllCosts)

router.get('/:id', auth, operatorCosts.getCostById)

router.put('/:id', auth, operatorCosts.updateCost)

router.delete('/removeKey', auth, operatorCosts.removeKeyFromAdditionalCosts)

router.delete('/:id', auth, operatorCosts.deleteCost)

module.exports = router;