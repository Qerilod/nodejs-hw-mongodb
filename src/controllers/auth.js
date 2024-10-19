import { loginUser } from '../services/auth.js';
import { logoutUser } from '../services/auth.js';
import { registerUser } from '../services/auth.js';
import { refreshSession } from '../services/auth.js';
import createError from 'http-errors';
import { env } from '../utils/env.js';
import nodemailer from 'nodemailer';
import User from '../db/models/user.js';
import jwt from 'jsonwebtoken';
import Session from '../db/models/session.js';

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await registerUser({ name, email, password });

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await loginUser({ email, password });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSessionController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createError(401, 'You are logged out, please log in again!');
    }

    const { accessToken } = await refreshSession(refreshToken);

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createError(401, 'You are logged out, please log in again!');
    }

    await logoutUser(refreshToken);

    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const sendResetEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found!');
    }
    const token = jwt.sign({ email }, env('JWT_SECRET'), { expiresIn: '5m' });
    const resetLink = `${env('APP_DOMAIN')}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port: env('SMTP_PORT'),
      auth: {
        user: env('SMTP_USER'),
        pass: env('SMTP_PASSWORD'),
      },
    });

    const mailOptions = {
      from: env('SMTP_FROM'),
      to: email,
      subject: 'Password Reset',
      html: `<p>To reset your password, click on the following link:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>The link is valid for 5 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    if (error.message.includes('Failed to send')) {
      next(
        createError(500, 'Failed to send the email, please try again later.'),
      );
    } else {
      next(error);
    }
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, env('JWT_SECRET'));
    } catch {
      throw createError(401, 'Token is expired or invalid.');
    }

    const { email } = decoded;

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found!');
    }

    user.password = password;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
