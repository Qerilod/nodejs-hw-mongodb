import { contactsModel } from '../db/models/contact.js';

export const getAllContacts = async () => {
  return await contactsModel.find();
};

export const getContactById = async (contactId) => {
  return await contactsModel.findById(contactId);
};

export const createContact = async (contactData) => {
  const newContact = new contactsModel(contactData);
  await newContact.save();
  return newContact;
};

export const updateContact = async (contactId, updateData) => {
  const updatedContact = await contactsModel.findByIdAndUpdate(
    contactId,
    updateData,
    { new: true },
  );

  return updatedContact;
};

export const deleteContact = async (contactId) => {
  const deletedContact = await contactsModel.findByIdAndDelete(contactId);
  return deletedContact;
};
