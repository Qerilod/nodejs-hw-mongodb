import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getAllContactsCount,
} from '../services/contacts.js';

export const getAllContactsController = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 5,
      sortBy = 'name',
      sortOrder = 'asc',
      type,
      isFavourite,
    } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(perPage);

    const filter = {};

    if (type) {
      filter.contactType = type;
    }

    if (isFavourite !== undefined) {
      filter.isFavourite = isFavourite === 'true';
    }

    const totalItems = await getAllContactsCount();
    const contacts = await getAllContacts(
      currentPage,
      itemsPerPage,
      sortBy,
      sortOrder,
      filter,
    );

    if (!contacts || contacts.length === 0) {
      throw createError(404, 'Contacts not found');
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data: contacts,
        page: currentPage,
        perPage: itemsPerPage,
        totalItems,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) {
    throw createError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  if (!name || !phoneNumber) {
    throw createError(400, 'Name or phonenumber are required');
  }

  const newContact = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const updateData = req.body;

  const updatedContact = await updateContact(contactId, updateData);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const deletedContact = await deleteContact(contactId);

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};
