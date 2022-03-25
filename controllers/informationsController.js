'use strict';

const firestore = require('../configure/firestore');

const Information = require('../models/informations');
const addInformation = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('informations').doc().set(data); 
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllInformations = async (req, res, next) => {
    try {
        const Informations = await firestore.collection('Informations');
        const data = await Informations.get();
        const InformationsArray = [];
        if(data.empty) {
            res.status(404).send('No Information record found');
        }else {
            data.forEach(doc => {
                const Information = new Information(
                    doc.id,
                    doc.data().address,
                    doc.data().phone,
                    doc.data().receiver
                );
                InformationsArray.push(Information);
            });
            res.send(InformationsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getInformation = async (req, res, next) => {
    try {
        const id = req.params.id;
        const Information = await firestore.collection('Informations').doc(id);
        const data = await Information.get();
        if(!data.exists) {
            res.status(404).send('Information with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateInformation = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const Information =  await firestore.collection('Informations').doc(id);
        await Information.update(data);
        res.send('Information record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteInformation = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('Informations').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addInformation,
    getAllInformations,
    getInformation,
    updateInformation,
    deleteInformation
}