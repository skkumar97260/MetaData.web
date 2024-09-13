const express = require('express');
const router = express.Router();
const { createUser, verifyOtp } = require('../controller/signup');
const { basicAuth } = require('../middleware/basicauth');
const { checkSession } = require('../middleware/tokenManager');
const { checkBody } = require('../middleware/validators');

router.post('/',
    basicAuth,
    checkBody([ 'phoneNumber']),
    createUser,
);
router.post('/verifyOtp',
    basicAuth,
    checkBody(['phoneNumber', 'otp']),
    verifyOtp,

)
module.exports = router;
