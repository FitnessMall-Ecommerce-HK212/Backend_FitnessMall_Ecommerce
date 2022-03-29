const express = require('express');
const {
        getAllBlogs,
        getBlog,
        addComment,
      } = require('../controllers/blogsController');

const router = express.Router();

// router.post('/blog', addBlog);
router.post('/add-cmt', addComment);
router.get('/:id', getBlog);
router.get('/', getAllBlogs);
// router.put('/:id', updateBlog);
// router.delete('/:id', deleteBlog);


module.exports = router;