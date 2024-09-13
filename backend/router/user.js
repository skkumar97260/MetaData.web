const express = require('express');
const router = express.Router();
const { getUser } = require('../controller/user');
const { basicAuth } = require('../middleware/basicauth');
const { checkBody } = require('../middleware/validators');
const { checkSession } = require('../middleware/tokenManager');

router.get ('/',
    basicAuth,
    getUser,
    checkSession
);
module.exports = router