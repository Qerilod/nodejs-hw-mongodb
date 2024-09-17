import mongoose from 'mongoose';
import { MONGO_DB_VARS } from '../utils/constants.js';
import { env } from '../utils/env.js';
export const initMongoConnection = async () => {
  try {
    const user = env(MONGO_DB_VARS.MONGO_USER);
    const pass = env(MONGO_DB_VARS.MONGO_PASSWORD);
    const url = env(MONGO_DB_VARS.MONGO_URL);
    const db = env(MONGO_DB_VARS.MONGO_DB);

    await mongoose.connect(
      `mongodb+srv://${user}:${pass}@${url}/${db}?retryWrites=true&w=majority&appName=hw2`,
    );
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.log('Error conection', error);
    throw error;
  }
};
