// server/utils/validators.js

const Joi = require('joi');

/**
 * Validate login credentials
 * @param {Object} data - Login data to validate
 * @returns {Object} Validation result
 */
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
      })
  });
  
  return schema.validate(data);
};

/**
 * Validate user registration data
 * @param {Object} data - Registration data to validate
 * @returns {Object} Validation result
 */
const validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
      }),
    role: Joi.string()
      .valid('admin', 'manager', 'viewer')
      .messages({
        'any.only': 'Role must be one of: admin, manager, viewer'
      })
  });
  
  return schema.validate(data);
};

/**
 * Validate user update data
 * @param {Object} data - User update data to validate
 * @returns {Object} Validation result
 */
const validateUserUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'string.empty': 'Name cannot be empty'
      }),
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email cannot be empty'
      }),
    password: Joi.string()
      .min(6)
      .allow('')
      .allow(null)
      .messages({
        'string.min': 'Password must be at least 6 characters'
      }),
    role: Joi.string()
      .valid('admin', 'manager', 'viewer')
      .messages({
        'any.only': 'Role must be one of: admin, manager, viewer'
      }),
    status: Joi.string()
      .valid('active', 'inactive')
      .messages({
        'any.only': 'Status must be one of: active, inactive'
      })
  });
  
  return schema.validate(data);
};

/**
 * Validate password change data
 * @param {Object} data - Password change data to validate
 * @returns {Object} Validation result
 */
const validatePasswordChange = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Current password is required',
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters',
        'string.empty': 'New password is required',
        'any.required': 'New password is required'
      })
  });
  
  return schema.validate(data);
};

/**
 * Validate sales data
 * @param {Object} data - Sales data to validate
 * @returns {Object} Validation result
 */
const validateSale = (data) => {
  const schema = Joi.object({
    invoice_id: Joi.string()
      .required()
      .messages({
        'string.empty': 'Invoice ID is required',
        'any.required': 'Invoice ID is required'
      }),
    date: Joi.date()
      .required()
      .messages({
        'date.base': 'Date must be a valid date',
        'any.required': 'Date is required'
      }),
    customer_id: Joi.string()
      .required()
      .messages({
        'string.empty': 'Customer ID is required',
        'any.required': 'Customer ID is required'
      }),
    item_net: Joi.number()
      .required()
      .messages({
        'number.base': 'Net amount must be a number',
        'any.required': 'Net amount is required'
      }),
    // Add more fields as needed
    quantity: Joi.number()
      .integer()
      .min(1)
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1'
      }),
    price: Joi.number()
      .positive()
      .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be positive'
      })
  }).unknown(true); // Allow other fields not defined in the schema
  
  return schema.validate(data);
};

/**
 * Validate target data
 * @param {Object} data - Target data to validate
 * @returns {Object} Validation result
 */
const validateTarget = (data) => {
  const schema = Joi.object({
    target_type: Joi.string()
      .required()
      .messages({
        'string.empty': 'Target type is required',
        'any.required': 'Target type is required'
      }),
    target_id: Joi.string()
      .required()
      .messages({
        'string.empty': 'Target ID is required',
        'any.required': 'Target ID is required'
      }),
    target_value: Joi.number()
      .required()
      .positive()
      .messages({
        'number.base': 'Target value must be a number',
        'number.positive': 'Target value must be positive',
        'any.required': 'Target value is required'
      }),
    period_start: Joi.date()
      .messages({
        'date.base': 'Period start must be a valid date'
      }),
    period_end: Joi.date()
      .min(Joi.ref('period_start'))
      .messages({
        'date.base': 'Period end must be a valid date',
        'date.min': 'Period end must be after period start'
      }),
    currency: Joi.string()
      .default('OMR')
      .messages({
        'string.empty': 'Currency cannot be empty'
      })
  }).unknown(true); // Allow other fields not defined in the schema
  
  return schema.validate(data);
};

module.exports = {
  validateLogin,
  validateRegistration,
  validateUserUpdate,
  validatePasswordChange,
  validateSale,
  validateTarget
};