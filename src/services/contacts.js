import { contactsModel } from '../db/models/contact.js';

export const getAllContacts = async () => {
  const contacts = await contactsModel.find();
  return contacts;
};

export const getContactById = async (contactId) => {
  const contact = await contactsModel.findById(contactId);
  return contact;
};
