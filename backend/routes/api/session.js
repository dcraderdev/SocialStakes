// backend/routes/api/session.js
const express = require('express');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Deck, Game } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors, validateSpotEdit, validateReview, validateSignup, validateLogin } = require('../../utils/validation');
const router = express.Router();
const {themeController} = require('../../controllers/themeController')
const {
  singleFileUpload,
  singleMulterUpload,
  multipleFilesUpload,
  multipleMulterUpload,
  retrievePrivateFile,
} = require('../../awsS3');

// Login
// need to make sure that the correct CSRF token
// is being sent with each request that requires protection
router.post('/',validateLogin, async (req, res, next) => {

  const { credential, password } = req.body;
  const user = await User.login({ credential, password });

  if(user){
    const token = await setTokenCookie(res, user);
    return res.status(200).json({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              username: user.username,
              balance: user.balance
             });
  }

  const err = new Error("Invalid credentials") 
  err.statusCode = 401
  err.status = 401;
  next(err)
  
});


// Log out
router.delete('/', (_req, res) => {
  // res.clearCookie('XSRF-TOKEN');
  res.clearCookie('token');
  return res.json({ message: 'success' });
});


// Restore session user
router.get('/', requireAuth,restoreUser, (req, res) => {
  const { user } = req;

  if (user) {
    return res.json({
      user: user.toSafeObject()
    });
  } else return res.json({});
});


// Get themes
router.get('/themes', async (_req, res) => {

  const themes = await themeController.getThemes()
  if(!themes){
    const err = new Error("No themes found") 
    err.statusCode = 404
    err.status = 404;
    next(err)
  }



  const themeUrls = themes.map((theme) => {
    let url = retrievePrivateFile(theme.url);
    let name = theme.name
    return {url, name}
  });

  return res.json({ themeUrls });
});


// Restore session user
router.get('/', requireAuth,restoreUser, (req, res) => {
  const { user } = req;

  if (user) {
    return res.json({
      user: user.toSafeObject()
    });
  } else return res.json({});
});

module.exports = router;