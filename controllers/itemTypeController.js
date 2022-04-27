'use strict';

const firestore = require('../configure/firestore');

const ItemType = require('../models/itemtype');
const addItemType = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('itemtype').doc().set(data); 
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllItemTypes = async (req, res, next) => {
    try {
        const ItemTypes = await firestore.collection('ItemTypes');
        const data = await ItemTypes.get();
        const ItemTypesArray = [];
        if(data.empty) {
            res.status(404).send('No ItemType record found');
        }else {
            data.forEach(doc => {
                const ItemType = new ItemType(
                    doc.id,
                    doc.data().cateory,
                    doc.data().price,
                    doc.data().quantity
                );
                ItemTypesArray.push(ItemType);
            });
            res.send(ItemTypesArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getItemType = async (req, res, next) => {
    try {
        const id = req.params.id;
        const ItemType = await firestore.collection('ItemTypes').doc(id);
        const data = await ItemType.get();
        if(!data.exists) {
            res.status(404).send('ItemType with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateItemType = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const ItemType =  await firestore.collection('ItemTypes').doc(id);
        await ItemType.update(data);
        res.send('ItemType record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteItemType = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('ItemTypes').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addItemType,
    getAllItemTypes,
    getItemType,
    updateItemType,
    deleteItemType
}