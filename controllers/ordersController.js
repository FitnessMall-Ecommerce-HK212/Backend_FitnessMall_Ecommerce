'use strict';

const firestore = require('../configure/firestore');

const Order = require('../models/orders');
const md5 = require('md5');

const addOrder = async (req, res, next) => {
    try {
        const logistics_interface = `{"eccompanyid":"CUSMODEL","customerid":"084LC012345","logisticprviderid":"JNT","txlogisticid":"322SA1112A11","fieldlist":[{"txlogisticid":"322SA1112A11","fieldname": "status","fieldvalue": "WITHDRAW","remark": "test"}]}`;
        const key = '04fc653c0f661e1204bd804774e01824';

        const data_digest = Buffer.from(md5(logistics_interface + key)).toString('base64');
        res.send(data_digest);

        // const data = req.body;
        // await firestore.collection('orders').doc().set(data); 
        // res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllOrders = async (req, res, next) => {
    try {
        const Orders = await firestore.collection('Orders');
        const data = await Orders.get();
        const OrdersArray = [];
        if (data.empty) {
            res.status(404).send('No Order record found');
        } else {
            data.forEach(doc => {
                const Order = new Order(
                    doc.id,
                    doc.data().username,
                    doc.data().pwd,
                    doc.data().state,
                    doc.data().ts,
                    doc.data().age,
                    doc.data().receiptID,
                    doc.data().shipID
                );
                OrdersArray.push(Order);
            });
            res.send(OrdersArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getOrder = async (req, res, next) => {
    try {
        const id = req.params.id;
        const Order = await firestore.collection('Orders').doc(id);
        const data = await Order.get();
        if (!data.exists) {
            res.status(404).send('Order with the given ID not found');
        } else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateOrder = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const Order = await firestore.collection('Orders').doc(id);
        await Order.update(data);
        res.send('Order record updated successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteOrder = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('Orders').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addOrder,
    getAllOrders,
    getOrder,
    updateOrder,
    deleteOrder
}