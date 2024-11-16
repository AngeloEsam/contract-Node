const express = require('express');
const router = express.Router();
const { createWorkConfirmation } = require('../controllers/workConfirmationController');
const { auth } = require('../middlewares/auth');

router.post('/create',auth, createWorkConfirmation);

module.exports = router;
