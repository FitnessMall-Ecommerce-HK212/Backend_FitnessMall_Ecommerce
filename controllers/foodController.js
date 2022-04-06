'use strict';

const firestore = require('../configure/firestore'); 
const Food = require('../models/users'); 

const updateFeedback = async (req, res, next) => {
    res.send("Hello");
}

const addFood = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('food').doc().set(data); 
        console.log("AKJ");
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
        console.log("MNV");
    }
}

const getAllFoods = async (req, res, next) => {
    try {
        const foods = await firestore.collection('food');
        const data = await foods.get();
        const foodsArray = [];
        if(data.empty) {
            res.status(404).send('No food record found');
        }else {
            data.forEach(doc => {
                const food = new Food(
                    doc.id,
                    doc.data().code,
                    doc.data().description,
                    getAllItemType(doc.collection('itemtype')),
                    getAllFeedBack(doc.collection('feedback')),
                    doc.data().image,
                    doc.data().name
                );
                foodsArray.push(food);
            });
            res.send(foodsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getFood = async (req, res, next) => {
    try {
        const id = req.params.id;
        const food = await firestore.collection('food').doc(id);
        const data = await food.get();
        if(!data.exists) {
            res.status(404).send('Food with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateFood = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const food =  await firestore.collection('food').doc(id);
        await food.update(data);
        res.send('Food record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteFood = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('food').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addFood,
    getAllFoods,
    getFood,
    updateFood,
    deleteFood,
    updateFeedback
}