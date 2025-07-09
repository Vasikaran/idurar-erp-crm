const Joi = require('joi');

const createQuerySchema = Joi.object({
  customerName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Customer name is required',
    'string.min': 'Customer name must be at least 2 characters long',
    'string.max': 'Customer name cannot exceed 100 characters',
    'any.required': 'Customer name is required',
  }),

  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  description: Joi.string().trim().min(10).max(1000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Description is required',
  }),

  status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').optional().messages({
    'any.only': 'Status must be one of: open, in-progress, resolved, closed',
  }),

  resolution: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Resolution cannot exceed 1000 characters',
  }),
});

const updateQuerySchema = Joi.object({
  customerName: Joi.string().trim().min(2).max(100).optional().messages({
    'string.empty': 'Customer name cannot be empty',
    'string.min': 'Customer name must be at least 2 characters long',
    'string.max': 'Customer name cannot exceed 100 characters',
  }),

  email: Joi.string().trim().email().optional().messages({
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please provide a valid email address',
  }),

  description: Joi.string().trim().min(10).max(1000).optional().messages({
    'string.empty': 'Description cannot be empty',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 1000 characters',
  }),

  status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').optional().messages({
    'any.only': 'Status must be one of: open, in-progress, resolved, closed',
  }),

  resolution: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Resolution cannot exceed 1000 characters',
  }),
});

const addNoteSchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Note content is required',
    'string.min': 'Note content cannot be empty',
    'string.max': 'Note content cannot exceed 500 characters',
    'any.required': 'Note content is required',
  }),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.min': 'Page number must be greater than 0',
    'number.integer': 'Page number must be an integer',
  }),

  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.min': 'Limit must be greater than 0',
    'number.max': 'Limit cannot exceed 100',
    'number.integer': 'Limit must be an integer',
  }),
});

const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required',
  });

module.exports = {
  createQuerySchema,
  updateQuerySchema,
  addNoteSchema,
  paginationSchema,
  objectIdSchema,
};
