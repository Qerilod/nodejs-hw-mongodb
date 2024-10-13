import { contactsModel } from '../db/models/contact.js';

export const getAllContacts = async (userId, page, perPage) => {
  const skip = (page - 1) * perPage;
  return await contactsModel.find({ userId }).skip(skip).limit(perPage);
};

export const getAllContactsCount = async (userId) => {
  return await contactsModel.countDocuments({ userId });
};

export const getContactById = async (userId, contactId) => {
  return await contactsModel.findOne({ _id: contactId, userId });
};

export const createContact = async (contactData) => {
  const newContact = new contactsModel(contactData);
  await newContact.save();
  return newContact;
};

export const updateContact = async (userId, contactId, updateData) => {
  const updatedContact = await contactsModel.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true },
  );
  return updatedContact;
};

export const deleteContact = async (userId, contactId) => {
  const deletedContact = await contactsModel.findOneAndDelete({
    _id: contactId,
    userId,
  });
  return deletedContact;
};
