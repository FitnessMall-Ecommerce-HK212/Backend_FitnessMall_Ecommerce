const express = require('express');
const { signUp,
  signIn,
  author,
  signOut,
  getSession,
  getAllUsers,
  getUser,
  updateUser,
  // deleteUser
} = require('../controllers/usersController');

const router = express.Router();

router.get('/user_author/:sessionID', author);
router.get('/user_signin', signIn);
router.get('/user_signout/:sessionID', signOut);
router.post('/user_signup', signUp);
router.get('/user_session/:sessionID', getSession);
router.get('/users', getAllUsers);
router.get('/user/:username', getUser);
router.put('/user/:username/update', updateUser);
// router.delete('/user/:username', deleteUser);


module.exports = {
  routes: router
}