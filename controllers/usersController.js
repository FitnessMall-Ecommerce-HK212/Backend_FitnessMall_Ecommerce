'use strict';

const firestore = require('../configure/firestore');

const User = require('../models/users');
const addUser = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('users').doc().set(data); 
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const Users = await firestore.collection('Users');
        const data = await Users.get();
        const UsersArray = [];
        if(data.empty) {
            res.status(404).send('No User record found');
        }else {
            data.forEach(doc => {
                const User = new User(
                    doc.id,
                    doc.data().username,
                    doc.data().pwd,
                    doc.data().name,
                    doc.data().avatar,
                    doc.data().role,
                    doc.data().height,
                    doc.data().weight,
                    getAllInformations(doc.collection(information))//TODO: sai nè
                );
                UsersArray.push(User);
            });
            res.send(UsersArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const User = await firestore.collection('Users').doc(id);
        const data = await User.get();
        if(!data.exists) {
            res.status(404).send('User with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const User =  await firestore.collection('Users').doc(id);
        await User.update(data);
        res.send('User record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('Users').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
}