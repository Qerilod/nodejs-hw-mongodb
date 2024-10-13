import Session from '../db/models/session.js';
import createError from 'http-errors';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createError(401, 'Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw createError(401, 'Access token is missing');
    }

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
