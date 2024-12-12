const express = require("express");
const auth = require("../../middleware/auth");
const validateViewAccess = require("../../middleware/validateViewPermission");
const router = express.Router();
const businessIntelligence = require('../../controllers/businessIntelligence');

const DASHBOARD_ID = 'businessIntelligence'
router.get('/', auth, validateViewAccess(DASHBOARD_ID), businessIntelligence.getInsights);

module.exports = router;