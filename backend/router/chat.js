const express = require('express');
const router = express.Router();
const {userSendMessage,getChat} =require ('../controller/chat');
const {basicAuth} = require ('../middleware/basicauth');
const {checkBody} = require ('../middleware/validators');
const {checkSession} = require ('../middleware/tokenManager');

router.post ('/',
    basicAuth,
    checkBody(['userFrom','userTo','message','senderType']),
    userSendMessage,
    checkSession
)

router.get('/chat',
    basicAuth,
    getChat,
    checkSession
)
module.exports = router