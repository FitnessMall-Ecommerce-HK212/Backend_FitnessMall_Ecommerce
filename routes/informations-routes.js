const express = require('express');
const {addInformation, 
       getAllInformations, 
       getInformation,
       updateInformation,
       deleteInformation
      } = require('../controllers/informationsController');

const router = express.Router();

router.get('/infos/:username', getAllInformations);
router.get('/info/:username/:id', getInformation);
router.post('/info/:username', addInformation);
router.put('/info/:username/:id', updateInformation);
router.delete('/info/:username/:id', deleteInformation);


module.exports = {
    routes: router
}