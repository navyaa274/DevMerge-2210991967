const Joi = require('joi');

/**
 * Validation schemas for authentication and user management
 */

// Common validation patterns
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const phonePattern = /^[+]?[\d\s-()]+$/;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

/**
 * User Registration Validation
 */
const validateRegistration = (data) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(passwordPattern)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      }),
    
    role: Joi.string()
      .valid('super_admin', 'admin', 'hod', 'faculty', 'student')
      .default('student')
      .messages({
        'any.only': 'Invalid role specified'
      }),
    
    department: Joi.string()
      .pattern(objectIdPattern)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid department ID format'
      }),
    
    programId: Joi.string()
      .pattern(objectIdPattern)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid program ID format'
      }),
    
    phone: Joi.string()
      .pattern(phonePattern)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      }),
    
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future'
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer_not_to_say')
      .default('prefer_not_to_say')
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * User Login Validation
 */
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      }),
    
    twoFactorToken: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .optional()
      .messages({
        'string.length': 'Two-factor token must be 6 digits',
        'string.pattern.base': 'Two-factor token must contain only digits'
      }),
    
    rememberMe: Joi.boolean()
      .default(false)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Password Reset Validation
 */
const validatePasswordReset = (data) => {
  const schema = Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(passwordPattern)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Forgot Password Validation
 */
const validateForgotPassword = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Email Verification Validation
 */
const validateEmailVerification = (data) => {
  const schema = Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Verification token is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Change Password Validation
 */
const validateChangePassword = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(passwordPattern)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required'
      }),
    
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'New passwords do not match',
        'any.required': 'New password confirmation is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Profile Update Validation
 */
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    
    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    
    phone: Joi.string()
      .pattern(phonePattern)
      .allow('', null)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid phone number'
      }),
    
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future'
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer_not_to_say')
      .optional(),
    
    bio: Joi.string()
      .max(500)
      .allow('', null)
      .optional()
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Department Validation
 */
const validateDepartment = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Department name is required',
        'string.min': 'Department name must be at least 2 characters long',
        'string.max': 'Department name cannot exceed 100 characters',
        'any.required': 'Department name is required'
      }),
    
    code: Joi.string()
      .trim()
      .min(2)
      .max(10)
      .pattern(/^[A-Z0-9]+$/)
      .required()
      .messages({
        'string.empty': 'Department code is required',
        'string.min': 'Department code must be at least 2 characters long',
        'string.max': 'Department code cannot exceed 10 characters',
        'string.pattern.base': 'Department code must contain only uppercase letters and numbers',
        'any.required': 'Department code is required'
      }),
    
    description: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    
    hod: Joi.string()
      .pattern(objectIdPattern)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid HOD ID format'
      }),
    
    isActive: Joi.boolean()
      .default(true)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Program Validation
 */
const validateProgram = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Program name is required',
        'string.min': 'Program name must be at least 2 characters long',
        'string.max': 'Program name cannot exceed 100 characters',
        'any.required': 'Program name is required'
      }),
    
    code: Joi.string()
      .trim()
      .min(2)
      .max(10)
      .pattern(/^[A-Z0-9]+$/)
      .required()
      .messages({
        'string.empty': 'Program code is required',
        'string.min': 'Program code must be at least 2 characters long',
        'string.max': 'Program code cannot exceed 10 characters',
        'string.pattern.base': 'Program code must contain only uppercase letters and numbers',
        'any.required': 'Program code is required'
      }),
    
    department: Joi.string()
      .pattern(objectIdPattern)
      .required()
      .messages({
        'string.pattern.base': 'Invalid department ID format',
        'any.required': 'Department is required'
      }),
    
    description: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    
    duration: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Duration must be a number',
        'number.integer': 'Duration must be an integer',
        'number.min': 'Duration must be at least 1 year',
        'number.max': 'Duration cannot exceed 10 years',
        'any.required': 'Duration is required'
      }),
    
    degreeType: Joi.string()
      .valid('bachelors', 'masters', 'doctorate', 'diploma', 'certificate')
      .required()
      .messages({
        'any.only': 'Invalid degree type specified',
        'any.required': 'Degree type is required'
      }),
    
    isActive: Joi.boolean()
      .default(true)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Course Validation
 */
const validateCourse = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Course name is required',
        'string.min': 'Course name must be at least 2 characters long',
        'string.max': 'Course name cannot exceed 100 characters',
        'any.required': 'Course name is required'
      }),
    
    code: Joi.string()
      .trim()
      .min(2)
      .max(20)
      .pattern(/^[A-Z0-9]+$/)
      .required()
      .messages({
        'string.empty': 'Course code is required',
        'string.min': 'Course code must be at least 2 characters long',
        'string.max': 'Course code cannot exceed 20 characters',
        'string.pattern.base': 'Course code must contain only uppercase letters and numbers',
        'any.required': 'Course code is required'
      }),
    
    department: Joi.string()
      .pattern(objectIdPattern)
      .required()
      .messages({
        'string.pattern.base': 'Invalid department ID format',
        'any.required': 'Department is required'
      }),
    
    program: Joi.string()
      .pattern(objectIdPattern)
      .required()
      .messages({
        'string.pattern.base': 'Invalid program ID format',
        'any.required': 'Program is required'
      }),
    
    description: Joi.string()
      .max(2000)
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 2000 characters'
      }),
    
    credits: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Credits must be a number',
        'number.integer': 'Credits must be an integer',
        'number.min': 'Credits must be at least 1',
        'number.max': 'Credits cannot exceed 10',
        'any.required': 'Credits are required'
      }),
    
    semester: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Semester must be a number',
        'number.integer': 'Semester must be an integer',
        'number.min': 'Semester must be at least 1',
        'number.max': 'Semester cannot exceed 10',
        'any.required': 'Semester is required'
      }),
    
    faculty: Joi.string()
      .pattern(objectIdPattern)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid faculty ID format'
      }),
    
    isActive: Joi.boolean()
      .default(true)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Assignment Validation
 */
const validateAssignment = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Assignment title is required',
        'string.min': 'Assignment title must be at least 2 characters long',
        'string.max': 'Assignment title cannot exceed 200 characters',
        'any.required': 'Assignment title is required'
      }),
    
    description: Joi.string()
      .max(5000)
      .required()
      .messages({
        'string.empty': 'Assignment description is required',
        'string.max': 'Description cannot exceed 5000 characters',
        'any.required': 'Assignment description is required'
      }),
    
    course: Joi.string()
      .pattern(objectIdPattern)
      .required()
      .messages({
        'string.pattern.base': 'Invalid course ID format',
        'any.required': 'Course is required'
      }),
    
    type: Joi.string()
      .valid('assignment', 'project', 'quiz', 'exam', 'lab')
      .required()
      .messages({
        'any.only': 'Invalid assignment type specified',
        'any.required': 'Assignment type is required'
      }),
    
    maxMarks: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'number.base': 'Maximum marks must be a number',
        'number.integer': 'Maximum marks must be an integer',
        'number.min': 'Maximum marks must be at least 1',
        'number.max': 'Maximum marks cannot exceed 1000',
        'any.required': 'Maximum marks are required'
      }),
    
    dueDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Due date must be in the future',
        'any.required': 'Due date is required'
      }),
    
    instructions: Joi.string()
      .max(3000)
      .optional()
      .messages({
        'string.max': 'Instructions cannot exceed 3000 characters'
      }),
    
    isActive: Joi.boolean()
      .default(true)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Two-Factor Authentication Setup Validation
 */
const validateTwoFactorSetup = (data) => {
  const schema = Joi.object({
    token: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': 'Two-factor token must be 6 digits',
        'string.pattern.base': 'Two-factor token must contain only digits',
        'any.required': 'Two-factor token is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * User Search Validation
 */
const validateUserSearch = (data) => {
  const schema = Joi.object({
    search: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Search term is required',
        'string.min': 'Search term must be at least 2 characters long',
        'string.max': 'Search term cannot exceed 100 characters',
        'any.required': 'Search term is required'
      }),
    
    role: Joi.string()
      .valid('super_admin', 'admin', 'hod', 'faculty', 'student')
      .optional(),
    
    department: Joi.string()
      .pattern(objectIdPattern)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid department ID format'
      }),
    
    program: Joi.string()
      .pattern(objectIdPattern)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid program ID format'
      }),
    
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional(),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Pagination Validation
 */
const validatePagination = (data) => {
  const schema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional(),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .optional(),
    
    sortBy: Joi.string()
      .optional(),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateForgotPassword,
  validateEmailVerification,
  validateChangePassword,
  validateProfileUpdate,
  validateDepartment,
  validateProgram,
  validateCourse,
  validateAssignment,
  validateTwoFactorSetup,
  validateUserSearch,
  validatePagination
};
