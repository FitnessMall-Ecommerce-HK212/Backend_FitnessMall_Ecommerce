const express = require('express');
const {addCmt, 
       getAllCmts, 
       getCmt,
       updateCmt,
       deleteCmt
      } = require('../controllers/cmtsController');

const router = express.Router();

router.post('/cmt', addCmt);
router.get('/cmts', getAllCmts);
router.get('/cmt/:id', getCmt);
router.put('/cmt/:id', updateCmt);
router.delete('/cmt/:id', deleteCmt);


module.exports = {
    routes: router
}