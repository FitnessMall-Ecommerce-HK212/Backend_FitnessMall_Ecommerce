'use strict';

const firestore = require('../configure/firestore');
const Food = require('../models/food');
const Feedback = require('../models/feedback');

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
        const foods = await firestore.collection("food").get();
        if (foods.empty) res.send("No record found");
        else {
            var foodsArray = [];
            foods.forEach(food => {
                const data = food.data();
                foodsArray.push(new Food(
                    food.id,
                    data.code,
                    data.description,
                    data.image,
                    data.name,
                    data.price,
                    []
                ))
            });

            for (const food of foodsArray) {
                const feedbacks = await firestore.collection("food")
                .doc(food.id)
                .collection("feedback")
                .get();
                if (!feedbacks.empty) {
                    var feedbacksArray = [];
                    feedbacks.forEach(feedback => {
                        const data = feedback.data();
                        feedbacksArray.push(new Feedback(
                            feedback.id,
                            data.username,
                            data.content,
                            data.date,
                            data.point
                        ));
                    });
                    food.feedback = feedbacksArray;
                }
            }
            res.send(foodsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getFoodImage = async (req, res, next) => {
    try {
        if (req.params.foodCode === undefined) res.send("Missing Food Code Value");
        else {
            const foodCode = req.params.foodCode;
            const foods = await firestore.collection("food").where("code", "==", foodCode).get();

            if (foods.empty) res.send("Food does not exist");
            else {
                var image, name;
                foods.forEach(doc => {
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

const getFood = async (req, res, next) => {
    try {
        if (req.params.foodCode === undefined) res.send("Missing Food Code Value");
        else {
            const foodCode = req.params.foodCode;
            const foods = await firestore.collection("food").where("code", "==", foodCode).get();

            if (foods.empty) res.send("Food does not exist");
            else {
                var food;
                foods.forEach(doc => {
                    const data = doc.data();
                    food = new Food(
                        doc.id,
                        data.code,
                        data.description,
                        data.image,
                        data.name,
                        data.price,
                        [],
                        []
                    );
                })
                
                var feedbacksArray = [];
                const feedbacks = await firestore.collection("food").doc(food.id).collection("feedback").get();
                if (!feedbacks.empty) {
                    feedbacks.forEach(feedback => {
                        const data = feedback.data();
                        feedbacksArray.push(new Feedback(
                            feedback.id,
                            data.username,
                            data.content,
                            data.date,
                            data.point
                        ));
                    });
                    food.feedback = feedbacksArray;
                }
                res.send(food);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

const updateFood = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const food = await firestore.collection('food').doc(id);
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

const addFoodFeedBack = async (req, res, next) => {
    if (req.body.username === undefined) res.send("Missing Username Value");
    else if (req.body.content === undefined) res.send("Missing Content Value");
    else if (req.body.date === undefined) res.send("Missing Date Value");
    else if (req.body.point === undefined) res.send("Missing Point Value");
    else if (req.body.food_id === undefined) res.send("Missing Food ID Value");
    else {
        const { username, content, date, point, food_id } = req.body;
        const feedback = {
            "username": username,
            "content": content,
            "date": date,
            "point": point
        }
        try {
            await firestore.collection("food").doc(food_id).collection("feedback").add(feedback);
            res.status(200).send('Add feedback successfully')
        }
        catch (e) {
            res.status(500).send('Add feedback failed');
        }
    }
}

module.exports = {
    addFood,
    getAllFoods,
    getFood,
    updateFood,
    deleteFood,
    addFoodFeedBack,
    getFoodImage
}