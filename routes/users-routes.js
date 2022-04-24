const express = require('express');
const { signUp,
  signIn,
  author,
  signOut,
  getSession,
  getAllUsers,
  getUser,getVertify,
  updateUser,
  userGoogle,
  userGoogleReturn
} = require('../controllers/usersController');

const router = express.Router();

// SESSION
router.get('/user_author/:sessionID', author);
router.get('/user_session/:sessionID', getSession);

// NORMAL SIGN IN - SIGN UP
router.get('/user_signin', signIn);
router.post('/user_signup', signUp);
router.get('/user_signout/:sessionID', signOut);

// GOOGLE SIGN IN - SIGN UP
router.get('/user_signin_signup/google', userGoogle);
router.get('/user_signin_signup/google_return', userGoogleReturn);

// USER INFORMATION
router.post('/users/:username/vertify', getVertify);
router.get('/users', getAllUsers);
router.get('/user/:username', getUser);
router.put('/user/:username/update', updateUser);

module.exports = {
  routes: router
}