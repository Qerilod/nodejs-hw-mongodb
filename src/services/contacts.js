import { contactsModel } from '../db/models/contact.js';

export const getAllContacts = async (page, perPage) => {
  const skip = (page - 1) * perPage;
  return await contactsModel.find().skip(skip).limit(perPage);
};
export const getAllContactsCount = async () => {
  return await contactsModel.countDocuments();
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
