import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import { ENV_VARS } from './utils/constants.js';
import { env } from './utils/env.js';
import { getAllContacts, getContactById } from './services/contacts.js';
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

  app.get('/', (req, res) => {
    res.json({
      message: "Server working, it's good",
    });
  });

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });

  app.get('/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
      return res.status(404).json({
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  });

  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((error, req, res, next) => {
    res.status(500).json({
      message: 'An error occurred on the server',
      error: error.message,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export { setupServer };
