import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import { ENV_VARS } from './utils/constants.js';
import { env } from './utils/env.js';
import routerAuth from './routers/auth.js';
import router from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
const swagger = JSON.parse(
  fs.readFileSync(new URL('../docs/swagger.json', import.meta.url)),
);
const setupServer = () => {
  dotenv.config();

  const app = express();
  const PORT = env(ENV_VARS.PORT, 3000);

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use('/contacts', router);
  app.use('/auth', routerAuth);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger));
  app.use(notFoundHandler);

  app.use(errorHandler);
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export { setupServer };
