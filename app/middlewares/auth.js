import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { models } from '../app.js';

export default async (req, res, next) => {
  try {
    const accessToken = req.cookies?.token;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ status: 'error', message: 'Non authentifié.' });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.SECRET_KEY_ACCESS_TOKEN);
      req.auth = decoded;
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError' && refreshToken) {
        try {
          const decodedRefresh = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);

          const user = await models.Users.findByPk(decodedRefresh.userId);
          if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ status: 'error', message: 'Refresh token invalide.' });
          }

          const newAccessToken = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_ACCESS_TOKEN,
            { expiresIn: '15min' }
          );

          const newRefreshToken = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_REFRESH_TOKEN,
            { expiresIn: '7d' }
          );

          user.refreshToken = newRefreshToken;
          await user.save();

          const cookieConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            domain: process.env.NODE_ENV === 'production' ? '.aubin-manceau.fr' : undefined,
            path: '/',
          };

          res.cookie('token', newAccessToken, { ...cookieConfig, maxAge: 15 * 60 * 1000 });
          res.cookie('refreshToken', newRefreshToken, { ...cookieConfig, maxAge: 7 * 24 * 60 * 60 * 1000 });

          req.auth = { userId: user.id };
          return next();
        } catch (refreshErr) {
          return res.status(401).json({ status: 'error', message: 'Session expirée, reconnectez-vous.' });
        }
      }

      return res.status(401).json({ status: 'error', message: 'Token invalide.' });
    }

  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur d’authentification.' });
  }
};
