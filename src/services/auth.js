import bcrypt from 'bcrypt';
import createError from 'http-errors';
import User from '../db/models/user.js';
import Session from '../db/models/session.js';
import crypto from 'crypto';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });

  return newUser;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Invalid email');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw createError(401, 'Invalid password');
  }

  const existingSession = await Session.findOne({ userId: user._id });
  if (existingSession) {
    throw createError(400, 'User is already logged in');
  }

  const accessToken = crypto.randomBytes(32).toString('hex');
  const refreshToken = crypto.randomBytes(64).toString('hex');

  await Session.findOneAndDelete({ userId: user._id });

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

export const refreshSession = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createError(401, 'Invalid refresh token');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    throw createError(401, 'Refresh token expired');
  }

  const { userId } = session;

  const newAccessToken = crypto.randomBytes(32).toString('hex');
  const newRefreshToken = crypto.randomBytes(64).toString('hex');

  await Session.create({
    userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken: newAccessToken };
};

export const logoutUser = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createError(401, 'Session not found');
  }

  await Session.findOneAndDelete({ refreshToken });
};
