const express = require('express');
const {addBlog, 
       getAllBlogs, 
       getBlog,
       updateBlog,
       deleteBlog
      } = require('../controllers/usersController');

const router = express.Router();

router.post('/blog', addBlog);
router.get('/blogs', getAllBlogs);
router.get('/blog/:id', getBlog);
router.put('/blog/:id', updateBlog);
router.delete('/blog/:id', deleteBlog);


module.exports = {
    routes: router
}