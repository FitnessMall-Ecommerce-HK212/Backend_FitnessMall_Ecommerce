const express = require('express');
const {
        getAllBlogs,
        getBlog,
        addComment,
      } = require('../controllers/blogsController');

const router = express.Router();

// router.post('/blog', addBlog);
router.post('/blog/add-cmt', addComment);
router.get('/blogs/:id', getBlog);
router.get('/blogs', getAllBlogs);

module.exports = {
  routes: router
}