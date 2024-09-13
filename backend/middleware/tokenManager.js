const jwt = require('jsonwebtoken');
require('dotenv').config();

const { SECRET_KEY } = process.env;


const createJwtToken = (data = {}, secretKey) => {
    const token = jwt.sign(data, secretKey, { expiresIn: '8h' });
    return token;
};

const checkSession = (req, res, next) => {
    const token = req.headers['token'];

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = { createJwtToken, checkSession };
