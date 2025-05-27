const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Token manquant.' 
            });
        }
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_LOGIN);

        req.auth = {
            userId: decodedToken.userId
        };
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Token invalide ou expiré.',
        });
    }
};