const express = require('express');
const { sendEmailVerifed,
        verifiedEmail,
        sendEmailChangePassword,
        getCode
      } = require('../controllers/verifiedController');

const router = express.Router();

router.post('/send_email', sendEmailVerifed);
router.get('/user/forgotpass/code/:username', getCode)
router.get('/verify_email', verifiedEmail);
router.get('/user/forgotpass/:username', sendEmailChangePassword);

module.exports = {
    routes: router
}