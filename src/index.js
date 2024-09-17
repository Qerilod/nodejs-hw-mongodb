import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from '../src/server.js';

const boot = async () => {
  await initMongoConnection();
  setupServer();
};
boot();
