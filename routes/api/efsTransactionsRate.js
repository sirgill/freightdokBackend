const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const rateController = require('../../controllers/efsTransactionsRate')

router.post('/', auth, rateController.createRate);
router.get('/', auth, rateController.getAllRates);
router.get('/:id', auth, rateController.getRateByAmount);
router.put('/:id', auth, rateController.updateRate);
router.delete('/:id', auth, rateController.deleteRate);

module.exports = router;