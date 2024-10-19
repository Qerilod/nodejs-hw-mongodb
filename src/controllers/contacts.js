import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getAllContactsCount,
} from '../services/contacts.js';
import { cloudinary } from '../middlewares/cloudinaryConfig.js';

export const getAllContactsController = async (req, res, next) => {
  try {
    const { userId } = req;
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

    if (isNaN(currentPage) || currentPage <= 0) {
      return res
        .status(400)
        .json({ message: 'Page must be a positive number' });
    }

    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
      return res
        .status(400)
        .json({ message: 'perPage must be a positive number' });
    }

    const filter = {};

    if (type) {
      filter.contactType = type;
    }

    if (isFavourite !== undefined) {
      filter.isFavourite = isFavourite === 'true';
    }

    const totalItems = await getAllContactsCount(userId);
    const contacts = await getAllContacts(
      userId,
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
  try {
    const { contactId } = req.params;
    ///////
    const { userId } = req.user._id;
    //////
    if (!contactId) {
      return res.status(400).json({ message: 'Contact ID is required' });
    }

    const contact = await getContactById(userId, contactId);
    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;
    const userId = req.user._id;

    if (!name || !phoneNumber) {
      throw createError(400, 'Name or phonenumber are required');
    }
    let photoUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      photoUrl = result.secure_url;
    }

    const newContact = await createContact({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
      userId,
      photo: photoUrl,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    if (!contactId) {
      return res.status(400).json({ message: 'Contact ID is required' });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.photo = result.secure_url;
    }
    const updatedContact = await updateContact(userId, contactId, updateData);

    if (!updatedContact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    //////
    const { userId } = req.user._id;
    /////
    if (!contactId) {
      return res.status(400).json({ message: 'Contact ID is required' });
    }

    const deletedContact = await deleteContact(userId, contactId);
    if (!deletedContact) {
      throw createError(404, 'Contact not found');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
