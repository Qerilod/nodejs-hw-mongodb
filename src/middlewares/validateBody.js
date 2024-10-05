import Joi from 'joi';

export const postSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  contactType: Joi.string().valid('personal', 'work', 'home'),
  isFavourite: Joi.boolean(),
});

export const patchSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  phoneNumber: Joi.string().min(3).max(20),
  contactType: Joi.string().valid('personal', 'work', 'home'),
  isFavourite: Joi.boolean(),
});

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};
