'use strict';

const firestore = require('../configure/firestore');

const Order = require('../models/orders');
const md5 = require('md5');
const Product = require('../models/product');

const addOrder = async (req, res, next) => {
    try {
        if (req.body.username === undefined) res.send('Missing Username Value');
        else if (req.body.products === undefined) res.send('Missing Products Value');
        else if (req.body.account === undefined) res.send('Missing Account Value');
        else {
            const username = req.body.username;
            const products = req.body.products;
            const account = req.body.account;
            const timestamp = new Date();

            const amount = products.reduce(function (total, num) {
                return total += num.quantity * num.unit_price;
            }, 0);

            var docRef = await firestore.collection("orders").add({
                "amount": amount,
                "state": "Đang giao hàng",
                "timestamp": timestamp,
                "username": username
            });

            var productsRef = await firestore.collection("orders").doc(docRef.id).collection("products");
            var count = 0;
            products.forEach(async product => {
                count++;
                await productsRef.add({
                    "code": product.code,
                    "itemType": product.itemType,
                    "quantity": product.quantity,
                    "unit_price": product.unit_price
                });
            })

            var receiptRef = await firestore.collection("receipts").add({
                "account": account,
                "amount": amount,
                "timestamp": timestamp,
                "username": username
            });

            await firestore.collection("orders").doc(docRef.id).update({
                "receiptID": receiptRef.id
            });

            res.send({ msg: "Tạo đơn hàng thành công", count: count });
        }
        // const logistics_interface = `{"eccompanyid":"CUSMODEL","customerid":"084LC012345","logisticprviderid":"JNT","txlogisticid":"322SA1112A11","fieldlist":[{"txlogisticid":"322SA1112A11","fieldname": "status","fieldvalue": "WITHDRAW","remark": "test"}]}`;
        // const key = '04fc653c0f661e1204bd804774e01824';

        // const data_digest = Buffer.from(md5(logistics_interface + key)).toString('base64');
        // res.send(data_digest);

        // const data = req.body;
        // await firestore.collection('orders').doc().set(data); 
        // res.send('Record saved successfuly');
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
                        doc.data().shipID
                    );
                    OrdersArray.push(order);
                });

                for (var order of OrdersArray) {
                    const products = await firestore.collection("orders").doc(order.id).collection("products").get();
                    var productArray = [];
                    if (!products.exists) {
                        products.forEach(doc => {
                            const product = new Product(
                                doc.id,
                                doc.data().code,
                                doc.data().itemType,
                                doc.data().quantity,
                                doc.data().unit_price
                            );
                            productArray.push(product);
                        })
                    }
                    order.products = productArray;
                }
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
                    orders.data().shipID
                );

                const products = await firestore.collection("orders").doc(order.id).collection("products").get();
                var productArray = [];
                if (!products.exists) {
                    products.forEach(doc => {
                        const product = new Product(
                            doc.id,
                            doc.data().code,
                            doc.data().itemType,
                            doc.data().quantity,
                            doc.data().unit_price
                        );
                        productArray.push(product);
                    })
                }
                order.products = productArray;

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