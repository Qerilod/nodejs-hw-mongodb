import express from 'express';
import {
  registerController,
  resetPasswordController,
  sendResetEmailController,
} from '../controllers/auth.js';
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  validateBody,
} from '../middlewares/validateBody.js';

import { loginController } from '../controllers/auth.js';
import { refreshSessionController } from '../controllers/auth.js';
import { logoutController } from '../controllers/auth.js';

const routerAuth = express.Router();

routerAuth.post('/register', validateBody(registerSchema), registerController);
routerAuth.post('/login', validateBody(loginSchema), loginController);
routerAuth.post('/refresh', refreshSessionController);
routerAuth.post('/logout', logoutController);
routerAuth.post(
  '/send-reset-email',
  validateBody(emailSchema),
  sendResetEmailController,
);

routerAuth.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

export default routerAuth;
