import Session from '../db/models/session.js';
import createError from 'http-errors';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createError(401, 'Authorization header is missing');
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw createError(401, 'Authorization format is "Bearer [token]"');
    }
    const token = tokenParts[1];

    const session = await Session.findOne({ accessToken: token });

    if (!session) {
      throw createError(401, 'Invalid access token');
    }

    if (session.accessTokenValidUntil < new Date()) {
      throw createError(401, 'Access token expired');
    }

    req.user = session.userId;
    next();
  } catch (error) {
    next(error);
  }
};
