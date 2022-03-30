const express = require('express');
const { sendEmailVerifed,
        verifiedEmail
      } = require('../controllers/verifiedController');

const router = express.Router();

router.post('/send_email', sendEmailVerifed);
router.get('/verify_email', verifiedEmail);

module.exports = {
    routes: router
}