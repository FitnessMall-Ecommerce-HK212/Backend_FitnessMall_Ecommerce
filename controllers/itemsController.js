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
            let point = 0;
            const itemTypeList = [];
            const type = await firestore.collection('items').doc(value.id).collection('itemtype').get();
            const feedbacks = await firestore.collection('items').doc(value.id).collection('feedback').get();
            type.forEach((doc) => {
                console.log(doc.data());
                const itemType = new ItemType({
                    id: doc.id,
                    category: doc.data().category,
                    price: doc.data().price,
                    quantity: doc.data().quantity
                });
                itemTypeList.push(itemType);
            })
            feedbacks.forEach((e)=>{
                point += parseInt(e.data().point);
            })
            point = point / feedbacks.size;
            const item = new Item(
                value.id,
                value.data().code,
                value.data().description,
                value.data().image,
                value.data().name,
                null,
                null,
                itemTypeList,
                [], point
            );

            itemList.push(item);

            if (itemList.length == 5) {
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
        const items = await firestore.collection("items").get();
        if (items.empty) res.send("No record found");
        else {
            var itemsArray = [];
            items.forEach(item => {
                const data = item.data();
                itemsArray.push(new Item(
                    item.id,
                    data.code,
                    data.description,
                    data.image,
                    data.name,
                    data.price,
                    data.sold,
                    [],
                    []
                ))
            });

            for (const item of itemsArray) {
                const feedbacks = await firestore.collection("items").doc(item.id).collection("feedback").get();
                if (!feedbacks.empty) {
                    var feedbacksArray = [];
                    var score = 0;
                    feedbacks.forEach(feedback => {
                        const data = feedback.data();
                        feedbacksArray.push(new Feedback(
                            feedback.id,
                            data.username,
                            data.content,
                            data.date,
                            data.point
                        ));
                        score += parseInt(data.point);
                    });
                    item.feedback = feedbacksArray;
                    item.point = score/feedbacksArray.length;
                }
            }
            res.send(itemsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getItemImage = async (req, res, next) => {
    try {
        if (req.params.itemCode === undefined) res.send("Missing Item Code Value");
        else {
            const itemCode = req.params.itemCode;
            const items = await firestore.collection("items").where("code", "==", itemCode).get();

            if (items.empty) res.send("Item does not exist");
            else {
                var image, name;
                items.forEach(doc => {
                    const data = doc.data();
                    image = data.image;
                    name = data.name;
                });
                res.send({image: image, name: name});
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

const getItem = async (req, res, next) => {
    try {
        if (req.params.itemCode === undefined) res.send("Missing Item Code Value");
        else {
            const itemCode = req.params.itemCode;
            const items = await firestore.collection("items").where("code", "==", itemCode).get();

            if (items.empty) res.send("Item does not exist");
            else {
                var item;
                items.forEach(doc => {
                    const data = doc.data();
                    item = new Item(
                        doc.id,
                        data.code,
                        data.description,
                        data.image,
                        data.name,
                        data.price,
                        data.sold,
                        [],
                        []
                    );
                })
                
                var feedbacksArray = [];
                const feedbacks = await firestore.collection("items").doc(item.id).collection("feedback").get();
                if (!feedbacks.empty) {
                    var score = 0;
                    feedbacks.forEach(feedback => {
                        const data = feedback.data();
                        feedbacksArray.push(new Feedback(
                            feedback.id,
                            data.username,
                            data.content,
                            data.date,
                            data.point
                        ));
                        score += parseInt(data.point);
                    });
                    item.feedback = feedbacksArray;
                    item.point = score/feedbacksArray.length;
                }

                var itemTypesArray = [];
                const itemtypes = await firestore.collection("items").doc(item.id).collection("itemtype").get();
                if (!itemtypes.empty) {
                    itemtypes.forEach(itemtype => {
                        const data = itemtype.data();
                        itemTypesArray.push(new ItemType({
                            id: itemtype.id,
                            category: data.category,
                            price: data.price,
                            quantity: data.quantity
                        }));
                    });
                    item.itemtype = itemTypesArray;
                }

                res.send(item);
            }
        }
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
    if (req.body.username === undefined) res.send("Missing Username Value");
    else if (req.body.content === undefined) res.send("Missing Content Value");
    else if (req.body.date === undefined) res.send("Missing Date Value");
    else if (req.body.point === undefined) res.send("Missing Point Value");
    else if (req.body.item_id === undefined) res.send("Missing Item ID Value");
    else {
        const { username, content, date, point, item_id } = req.body;
        const feedback = {
            "username": username,
            "content": content,
            "date": date,
            "point": point
        }
        try {
            await firestore.collection("items").doc(item_id).collection("feedback").add(feedback);
            res.status(200).send('Add feedback successfully')
        }
        catch (e) {
            res.status(500).send('Add feedback failed');
        }
    }
}

module.exports = {
    getHotItems,
    addItem,
    getAllItems,
    getItem,
    updateItem,
    deleteItem,
    addFeedBack,
    getItemImage
}