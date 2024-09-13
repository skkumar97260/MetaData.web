const express = require('express');
const signup= require('./signup');
const login= require('./login');
const chat= require('./chat');
const user= require('./user');
const router = express.Router();

router.use('/signup', signup);
router.use('/login', login);
router.use('/chat', chat);
router.use('/user', user);
module.exports = router;
