// backend/utils/validation.js
const { validationResult } = require('express-validator');
const { check } = require('express-validator');
const { INTEGER } = require('sequelize');


// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {


  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) { 
    const errors = {};
    validationErrors
      .array()
      .forEach(error => errors[error.param] = error.msg);

    const err = Error("Bad request");
    err.errors = errors;
    err.message = "Validation Error";
    err.statusCode = 400;
    err.title = "Bad request";
    next(err);
  }
  next();
};


const validateSignup = [
  
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email'),

  check('username')
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.')
    .exists({ checkFalsy: true })
    .withMessage("Username is required")
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),

  check('firstName') 
    .exists({ checkFalsy: true })
    .withMessage('First Name is required'),

  check('lastName') 
    .exists({ checkFalsy: true })
    .withMessage('Last Name is required'),

  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.')
    .exists({ checkFalsy: true })
    .withMessage("Password is required"),
  handleValidationErrors,
];


const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Email or username is required'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required.'),
  handleValidationErrors,
];




const validateQueryParameters= [ 

  check('page')
  .optional()
  .isInt({ min: 1, max: 10 })
  .withMessage('Page must be greater than or equal to 1'),

  check('size')
  .optional()
  .isInt({ min: 1, max: 20 })
  .withMessage('Size must be greater than or equal to 1'),

  check('minLat')
  .optional()
  .isFloat()
  .withMessage('Minimum latitude is invalid'),

  check('maxLat')
  .optional()
  .isFloat()
  .withMessage('Maximum latitude is invalid'),
  
  check('minLng')
  .optional()
  .isFloat()
  .withMessage('Minimum longitude is invalid'),
  
  check('maxLng')
  .optional()
  .isFloat()
  .withMessage('Maximum longitude is invalid'),
  
  check('minPrice')
  .optional()
  .isFloat({ min: 0})
  .withMessage('Minimum price must be greater than or equal to 0'),
  
  check('maxPrice')
  .optional()
  .isFloat({ min: 0})
  .withMessage('Maximum price must be greater than or equal to 0'),
handleValidationErrors
]
 
 
 


module.exports = {
  handleValidationErrors,
  validateSignup, validateLogin, validateQueryParameters
};




