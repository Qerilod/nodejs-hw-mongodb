import express from 'express';
import { registerController } from '../controllers/auth.js';
import {
  loginSchema,
  registerSchema,
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

export default routerAuth;
