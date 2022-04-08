const express = require('express');
const {addInformation, 
       getAllInformations, 
       getInformation,
       updateInformation,
       deleteInformation,
       getProvince,
       getDistrict,
       getWard,
       getService
      } = require('../controllers/informationsController');

const router = express.Router();


router.get('/infos/province', getProvince);
router.get('/infos/district', getDistrict);
router.get('/infos/ward', getWard);
router.get('/infos/service', getService);

router.get('/infos/:username', getAllInformations);
router.get('/info/:username/:id', getInformation);
router.post('/info/:username', addInformation);
router.put('/info/:username/:id', updateInformation);
router.delete('/info/:username/:id', deleteInformation);



module.exports = {
    routes: router
}