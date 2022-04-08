'use strict';

const firestore = require('../configure/firestore');

const Receipt = require('../models/receipts');

const addReceipt = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('receipts').doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllReceipts = async (req, res, next) => {
    try {
        const Receipts = await firestore.collection('Receipts');
        const data = await Receipts.get();
        const ReceiptsArray = [];
        if (data.empty) {
            res.status(404).send('No Receipt record found');
        } else {
            data.forEach(doc => {
                const Receipt = new Receipt(
                    doc.id,
                    doc.data().username,
                    doc.data().account,
                    doc.data().amount,
                    doc.data().ts
                );
                ReceiptsArray.push(Receipt);
            });
            res.send(ReceiptsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getReceipt = async (req, res, next) => {
    try {
        if (req.params.receiptID === undefined) res.send("Missing receipt ID Value");
        else {
            const id = req.params.receiptID;
            const Receipt = await firestore.collection('receipts').doc(id);
            const data = await Receipt.get();
            if (!data.exists) {
                res.status(404).send('Receipt with the given ID not found');
            } else {
                res.send(data.data());
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateReceipt = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const Receipt = await firestore.collection('Receipts').doc(id);
        await Receipt.update(data);
        res.send('Receipt record updated successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteReceipt = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('Receipts').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addReceipt,
    getAllReceipts,
    getReceipt,
    updateReceipt,
    deleteReceipt
}