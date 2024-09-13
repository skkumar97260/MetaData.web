const express = require('express');
const router = express.Router();
const {login,verifyOtp} = require('../controller/login');
const {basicAuth} = require('../middleware/basicauth');
const {checkBody, checkParams} = require('../middleware/validators');
const {checkSession} = require('../middleware/tokenManager');


router.post('/',
    basicAuth,
    checkBody(['phoneNumber']),
    login
)

router.post('/verifyOtp',
    basicAuth,
    checkBody(['phoneNumber', 'otp']),
    verifyOtp
)

module.exports = router;