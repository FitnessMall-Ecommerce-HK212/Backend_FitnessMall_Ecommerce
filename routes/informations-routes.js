const express = require('express');
const {addInformation, 
       getAllInformations, 
       getInformation,
       updateInformation,
       deleteInformation
      } = require('../controllers/informationsController');

const router = express.Router();

router.post('/info', addInformation);
router.get('/infos', getAllInformations);
router.get('/info/:id', getInformation);
router.put('/info/:id', updateInformation);
router.delete('/info/:id', deleteInformation);


module.exports = {
    routes: router
}