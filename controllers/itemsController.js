'use strict';

const firestore = require('../configure/firestore');
const Item = require('../models/users');
const addItem = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('items').doc().set(data); 
        // console.log("AKJ");
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
        // console.log("MNV");
    }
}

const getAllItems = async (req, res, next) => {
    try {
        const Items = await firestore.collection('items');
        const data = await Items.get();
        const ItemsArray = [];
        if(data.empty) {
            res.status(404).send('No Item record found');
        }else {
            data.forEach(doc => {
                const Item = new Item(
                    doc.id,
                    doc.data().code,
                    doc.data().description,
                    getAllItemType(doc.collection('itemtype')),
                    getAllFeedBack(doc.collection('feedback')),
                    doc.data().image,
                    doc.data().name
                );
                ItemsArray.push(Item);
            });
            res.send(ItemsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getItem = async (req, res, next) => {
    try {
        const id = req.params.id;
        const Item = await firestore.collection('items').doc(id);
        const data = await Item.get();
        if(!data.exists) {
            res.status(404).send('Item with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateItem = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const Item =  await firestore.collection('items').doc(id);
        await Item.update(data);
        res.send('Item record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteItem = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('items').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addItem,
    getAllItems,
    getItem,
    updateItem,
    deleteItem
}