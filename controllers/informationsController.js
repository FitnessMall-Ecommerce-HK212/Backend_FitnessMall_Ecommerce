'use strict';

const firestore = require('../configure/firestore');

const Information = require('../models/informations');

const addInformation = async (req, res, next) => {
    try {
        if (req.body.receiver === undefined) res.send('Missing receiver value');
        else if (req.body.phone === undefined) res.send('Missing phone value');
        else if (req.body.address === undefined) res.send('Missing address value');
        else if (req.params.username === undefined) res.send('Missing username value');
        else {
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();

            var id;
            user.forEach(doc => {
                id = doc.id;
            });

            await firestore.collection('users').doc(id).collection('informations').add({
                'receiver': req.body.receiver,
                'address': req.body.address,
                'phone': req.body.phone
            });

            res.send('Add information successfully')
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllInformations = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send('Missing username value');
        else {
            const Informations = await firestore.collection('users')
                .where('username', "==", req.params.username)
                .get();

            var id;

            Informations.forEach(doc => {
                id = doc.id;
            });

            const data = await firestore.collection('users').doc(id).collection('informations').get();
            const InformationsArray = [];

            if (data.empty) {
                res.status(404).send('No Information record found');
            } else {
                data.forEach(doc => {
                    const information = new Information(
                        doc.id,
                        doc.data().address,
                        doc.data().phone,
                        doc.data().receiver
                    );
                    InformationsArray.push(information);
                });
                res.send(InformationsArray);
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getInformation = async (req, res, next) => {
    try {
        if (req.params.id === undefined) res.send("Missing ID value");
        else if (req.params.username === undefined) res.send("Missing username value");
        else {
            const id = req.params.id;
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();
            var userid;

            user.forEach(doc => {
                userid = doc.id;
            })

            const Information = await firestore.collection('users')
                .doc(userid)
                .collection('informations')
                .doc(id);

            const data = await Information.get();
            if (!data.exists) {
                res.status(404).send('Information with the given ID not found');
            } else {
                res.send(data.data());
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateInformation = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing username value");
        else if (req.params.id === undefined) res.send("Missing ID value");
        else if (req.body.receiver === undefined) res.send("Missing receiver value");
        else if (req.body.phone === undefined) res.send("Missing phone value");
        else if (req.body.address === undefined) res.send("Missing address value");
        else {
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();
            var userid;
            const id = req.params.id;

            user.forEach(doc => {
                userid = doc.id;
            });

            const data = req.body;
            await firestore.collection('users')
                .doc(userid)
                .collection('informations')
                .doc(id)
                .update(data);

            res.send('Information record updated successfuly');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteInformation = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing username value");
        else if (req.params.id === undefined) res.send("Missing ID value");
        else {
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();
            var userid;
            const id = req.params.id;

            user.forEach(doc => {
                userid = doc.id;
            });

            await firestore.collection('users')
                .doc(userid)
                .collection('informations')
                .doc(id)
                .delete();

            res.send('Record deleted successfuly');
        }
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