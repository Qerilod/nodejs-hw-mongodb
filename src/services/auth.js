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

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return newUser;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Invalid email ');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw createError(401, 'Invalid password');
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

  await Session.findOneAndDelete({ refreshToken });

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

// import bcrypt from 'bcrypt';
// import createError from 'http-errors';
// import User, { hashPassword } from '../db/models/user.js';
// import Session from '../db/models/session.js';
// import jwt from 'jsonwebtoken';
// import { env } from '../utils/env.js';
// import { MONGO_DB_VARS } from '../utils/constants.js';

// const JWT_SECRET = env(MONGO_DB_VARS.SECRET_KEY);

// if (!JWT_SECRET) {
//   throw new Error('JWT_SECRET is not defined in environment variables');
// }

// export const registerUser = async ({ name, email, password }) => {
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw createError(409, 'Email in use');
//   }

//   const newUser = await User.create({
//     name,
//     email,
//     password: hashPassword,
//   });

//   return newUser;
// };

// export const loginUser = async ({ email, password }) => {
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw createError(401, 'Invalid email');
//   }

//   const isPasswordCorrect = await bcrypt.compare(password, user.password);
//   if (!isPasswordCorrect) {
//     throw createError(401, 'Invalid password');
//   }

//   const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
//     expiresIn: '15m',
//   });
//   const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
//     expiresIn: '30d',
//   });

//   await Session.findOneAndDelete({ userId: user._id });

//   await Session.create({
//     userId: user._id,
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
//     refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//   });

//   return { accessToken, refreshToken };
// };

// export const refreshSession = async (refreshToken) => {
//   let decoded;
//   try {
//     decoded = jwt.verify(refreshToken, JWT_SECRET);
//   } catch {
//     throw createError(401, 'Invalid refresh token');
//   }

//   const session = await Session.findOne({ refreshToken });
//   if (!session) {
//     throw createError(401, 'Invalid refresh token');
//   }

//   if (session.refreshTokenValidUntil < new Date()) {
//     throw createError(401, 'Refresh token expired');
//   }

//   const { userId } = decoded;

//   const newAccessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
//   const newRefreshToken = jwt.sign({ userId }, JWT_SECRET, {
//     expiresIn: '30d',
//   });

//   await Session.findOneAndDelete({ refreshToken });

//   await Session.create({
//     userId,
//     accessToken: newAccessToken,
//     refreshToken: newRefreshToken,
//     accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
//     refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//   });

//   return { accessToken: newAccessToken, refreshToken: newRefreshToken };
// };

// export const logoutUser = async (refreshToken) => {
//   const session = await Session.findOne({ refreshToken });

//   if (!session) {
//     throw createError(401, 'Session not found');
//   }

//   await Session.findOneAndDelete({ refreshToken });
// };
