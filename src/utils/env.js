import dotenv from 'dotenv';
dotenv.config();

export const env = (name, valueDefault) => {
  const value = process.env[name];
  if (value) return value;
  if (valueDefault) return valueDefault;
  throw new Error(`Missing: process.env['${name}']`);
};
///
