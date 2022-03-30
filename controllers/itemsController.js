'use strict';

const firestore = require('../configure/firestore');
const ItemType = require('../models/itemtype');
const Item = require('../models/items');
const Feedback = require('../models/feedback');

const getHotItems = async (req, res, next) => {
    try {
        const items = await firestore.collection('items').orderBy('sold', 'desc').limit(10).get();
        // console.log(items);
        const itemList = [];
        await items.forEach(async (value) => {
            const itemTypeList = [];
            const type = await firestore.collection('items').doc(value.id).collection('itemtype').get();
            type.forEach((doc) => {
                // console.log(doc.data());
                const itemType = new ItemType({
                    id: doc.id,
                    category: doc.data().category,
                    price: doc.data().price,
                    quantity: doc.data().quantity
                });
                itemTypeList.push(itemType);
            })
            itemList.push(
                new Item({
                    id: value.id,
                    code: value.data().code,
                    description: value.data().description,
                    itemtype: itemTypeList,
                    feedback: null,
                    image: value.data().image,
                    name: value.data().name
                }));
            if (itemList.length == 10){
                res.status(200).send({
                    hotItems: itemList
                });
            }
        })
        
    } catch (e) {
        res.status(500).send(e);
        console.log(e);
    }
    
}

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
        if (data.empty) {
            res.status(404).send('No Item record found');
        } else {
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
        const item = await firestore.collection('items').doc(id).get();
        const itemType = await firestore.collection('items').doc(id).collection('itemtype').get();
        const itemTypeList = [];
        const feedbackList = [];
        itemType.forEach((value) => {
            itemTypeList.push(
                new ItemType({
                    id: value.id,
                    category: value.data().category,
                    price: value.data().price,
                    quantity: value.data().quantity
                })
            );
        });
        item.data().feedback.forEach((value) => {
            feedbackList.push(
                new Feedback({
                    id: feedbackList.length,
                    username: value.username,
                    date: value.date,
                    content: value.content,
                    point: value.point
                })
            )
        })

        res.status(200).send(new Item({
            id: item.id,
            code: item.data().code,
            description: item.data().description,
            itemtype: itemTypeList,
            feedback: feedbackList,
            image: item.data().image,
            name: item.data().name
        }))
        
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

const updateItem = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const Item = await firestore.collection('items').doc(id);
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

const addFeedBack = async (req, res, next) => {
    const {username, content, date, point, item_id} = req.body;
    const item = await firestore.collection('items').doc(item_id);
    const tmp = await firestore.collection('items').doc(item_id).get();
    const feedbacks = tmp.data().feedback ? tmp.data().feedback : []
    feedbacks.push({
        content: content,
            date: date,
            point: point,
            username: username
    });
    console.log(feedbacks);
    try {
        await item.set({
            feedback: feedbacks
        }, { merge: true });    
        res.status(200).send('Add feedback successfully')
    } catch(e){
        res.status(500).send('Add feedback failed');
    }
}

module.exports = {
    getHotItems,
    addItem,
    getAllItems,
    getItem,
    updateItem,
    deleteItem,
    addFeedBack
}