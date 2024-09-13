const auth = require('basic-auth');
require('dotenv').config();

exports.basicAuth = function (req, res, next) {
    const credentials = auth(req);

    if (!credentials ||
        credentials.name !== process.env.BASIC_AUTH_USERNAME ||
        credentials.pass !== process.env.BASIC_AUTH_PASSWORD) {
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: 'Unauthorized',
        });
    } else {
        next();
    }
}
