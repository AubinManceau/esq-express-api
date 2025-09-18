import jwt from 'jsonwebtoken';
import 'dotenv/config';

export default (req, res, next) => {
    try {
        let token;

        if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token && req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        }

        if (!token) {
            return res.status(401).json({ status: 'error', message: 'Token manquant.' });
        }

        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        req.auth = { userId: decodedToken.userId, roles: decodedToken.roles };
        next();

    } catch (error) {
        return res.status(401).json({
        status: 'error',
        message: 'Token invalide ou expiré. Merci de demander un refresh.',
        });
    }
};
