'use strict';

const firestore = require('../configure/firestore');
const axios = require('axios');
const uuid = require('uuid');

const Order = require('../models/orders');
const md5 = require('md5');
const Product = require('../models/product');

const addOrder = async (req, res, next) => {
    try {
        if (req.body.username === undefined) res.send('Missing Username Value');
        else if (req.body.products === undefined) res.send('Missing Products Value');
        else if (req.body.account === undefined) res.send('Missing Account Value');
        else if (req.body.information_id === undefined) res.send("Missing Information ID Value");
        else if (!['MOMO', 'ZALOPAY', 'PAYPAL'].includes(req.body.account)) res.send("Account Value doesn't match")
        else {
            // Get data from request body
            const username = req.body.username;
            const products = req.body.products;
            const account = req.body.account;
            const information_id = req.body.information_id;
            const timestamp = new Date();

            // Get total amount of order
            const amount = products.reduce(function (total, num) {
                return total += num.quantity * num.unit_price;
            }, 0);
            
            // Get user id
            var user = await firestore.collection("users").where("username", "==", username).get();
            var user_id;
            user.forEach(doc => {
                user_id = doc.id
            });

            // Get information for order
            const information = await firestore.collection("users")
                .doc(user_id)
                .collection("informations")
                .doc(information_id)
                .get();
            const information_data = information.data();

            // Create order - add information, products
            var docRef = await firestore.collection("orders").add({
                "amount": amount,
                "state": "Chưa thanh toán",
                "timestamp": timestamp,
                "username": username,
                "information": information_data,
                "products": products
            });

            // Create receipts for payment
            const momoOrderID = uuid.v1();
            var receiptRef = await firestore.collection("receipts").add({
                "account": account,
                "amount": amount,
                "timestamp": timestamp,
                "username": username,
                "state": "Chưa thanh toán",
                "momoOrderID": momoOrderID
            });

            // Update receiptID for order
            await firestore.collection("orders").doc(docRef.id).update({
                "receiptID": receiptRef.id
            });

            // Get PayUrl
            const extraData = `orderID=${docRef.id},phone=${information_data.phone},receiver=${information_data.receiver},province=${information_data.province},district=${information_data.district},ward=${information_data.ward},address=${information_data.address}`;            
            try {
                const result = await axios.post('http://localhost:8080/api/momo', { order_id: docRef.id, momoOrderID: momoOrderID, extraData: extraData });
                res.send(result.data);
            } catch (e) {
                res.status(500).send(e);
            }
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllOrders = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing Username Value");
        else {
            var Orders = await firestore.collection('orders')
                .where("username", "==", req.params.username)
                .get();

            var OrdersArray = [];
            if (Orders.empty) {
                res.status(404).send('No Order record found');
            } else {
                Orders.forEach(doc => {
                    const order = new Order(
                        doc.id,
                        doc.data().username,
                        doc.data().timestamp.toDate(),
                        doc.data().state,
                        doc.data().amount,
                        doc.data().receiptID,
                        doc.data().shipID,
                        doc.data().products,
                        doc.data().information
                    );
                    OrdersArray.push(order);
                });
                res.send(OrdersArray);
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getOrder = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing Username Value");
        else if (req.params.orderID === undefined) res.send("Missing OrderID Value");
        else {
            const username = req.params.username;
            const orderID = req.params.orderID;

            const orders = await firestore.collection('orders').doc(orderID).get();

            if (!orders.exists) {
                res.status(404).send('Order with the given ID not found');
            } else {
                const order = new Order(
                    orders.id,
                    orders.data().username,
                    orders.data().timestamp.toDate(),
                    orders.data().state,
                    orders.data().amount,
                    orders.data().receiptID,
                    orders.data().shipID,
                    orders.data().products,
                    orders.data().information
                );

                res.send(order);
            }
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