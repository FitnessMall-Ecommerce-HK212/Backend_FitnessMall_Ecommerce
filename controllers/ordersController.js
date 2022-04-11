'use strict';

const firestore = require('../configure/firestore');
const axios = require('axios');
const uuid = require('uuid');
const { shop_id, token } = require('../configure/GHN');
const { normalize } = require('../utils/string_utils');
const Order = require('../models/orders');
const md5 = require('md5');
const Product = require('../models/product');

const getShippingFee = async (req, res, next) => {
    try {
        if (req.query.province === undefined) res.send("Missing Province Value");
        else if (req.query.district === undefined) res.send("Missing District Value");
        else if (req.query.ward === undefined) res.send("Missing Ward Value");
        else {
            const province = await axios({
                method: 'GET',
                url: 'http://localhost:8080/api/infos/province'
            });

            const province_inform = province.data.filter(pro => normalize(pro.province_name) === normalize(req.query.province));

            const district = await axios({
                method: 'GET',
                url: 'http://localhost:8080/api/infos/district',
                params: {
                    province_id: province_inform[0].province_id
                }
            });

            const district_inform = district.data.filter(dis => normalize(dis.district_name) === normalize(req.query.district));

            const ward = await axios({
                method: 'GET',
                url: 'http://localhost:8080/api/infos/ward',
                params: {
                    district_id: district_inform[0].district_id
                }
            });

            const ward_inform = ward.data.filter(war => normalize(war.ward_name) === normalize(req.query.ward));

            const service_inform = await axios({
                method: 'GET',
                url: 'http://localhost:8080/api/infos/service',
                params: {
                    district_id: district_inform[0].district_id
                }
            });

            const body = {
                "from_district_id": 3695,
                "service_id": service_inform.data.service_id,
                "service_type_id": service_inform.data.service_type_id,
                "to_district_id": district_inform[0].district_id,
                "to_ward_code": ward_inform[0].ward_code,
                "height": 10,
                "length": 30,
                "weight": 20,
                "width": 40,
                "insurance_value": 0,
                "coupon": null
            }

            const result = await axios({
                method: 'POST',
                url: 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
                headers: {
                    token: token,
                    shop_id: shop_id
                },
                data: {
                    ...body
                }
            });

            if (result.data.code === 200) {
                res.send({ total_fee: result.data.data.total });
            } else res.send("Not found");
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

const addOrder = async (req, res, next) => {
    try {
        if (req.body.username === undefined) res.send('Missing Username Value');
        else if (req.body.products === undefined) res.send('Missing Products Value');
        else if (req.body.account === undefined) res.send('Missing Account Value');
        else if (req.body.information_id === undefined) res.send("Missing Information ID Value");
        else if (req.body.shipping_fee === undefined) res.send("Missing Shipping Fee Value");
        else if (req.body.discount_order === undefined) res.send("Missing discount order value");
        else if (req.body.discount_shipping === undefined) res.send("Missing discount shipping value");
        else if (!['MOMO', 'ZALOPAY', 'PAYPAL', 'CASH'].includes(req.body.account)) res.send("Account Value doesn't match")
        else {
            // Get data from request body
            const username = req.body.username;
            const products = req.body.products;
            const account = req.body.account;
            const information_id = req.body.information_id;
            const timestamp = new Date();
            const shipping_fee = req.body.shipping_fee;
            const discount_order = req.body.discount_order;
            const discount_shipping = req.body.discount_shipping;

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
                "state": req.body.account === "CASH" ? "Thanh toán khi nhận hàng" : "Chưa thanh toán",
                "timestamp": timestamp,
                "username": username,
                "information": information_data,
                "products": products
            });

            // Create receipts for payment
            const total_amount = amount + shipping_fee - discount_order - discount_shipping;
            const orderID = uuid.v1();
            var receiptRef = await firestore.collection("receipts").add({
                "account": account,
                "total_amount": total_amount,
                "timestamp": timestamp,
                "username": username,
                "state": req.body.account === "CASH" ? "Thanh toán khi nhận hàng" : "Chưa thanh toán",
                "vouchers": [],
                "receipt_details": {
                    "order_amount": amount,
                    "shipping_fee": shipping_fee,
                    "discount_order": discount_order,
                    "discount_shipping": discount_shipping
                }
            });

            // Add order type id to receipt
            switch (req.body.account) {
                case 'MOMO':
                    await firestore.collection("receipts").doc(receiptRef.id).update({
                        "momoOrderID": orderID,
                    });
                    break;
                case 'ZALOPAY':
                    await firestore.collection("receipts").doc(receiptRef.id).update({
                        "zalopayOrderID": orderID,
                    });
                    break;
                case 'PAYPAL':
                    await firestore.collection("receipts").doc(receiptRef.id).update({
                        "paypalOrderID": orderID,
                    });
                    break;
            }

            // Update receiptID for order
            await firestore.collection("orders").doc(docRef.id).update({
                "receiptID": receiptRef.id
            });

            // Get PayUrl
            const extraData = `orderID=${docRef.id},phone=${information_data.phone},receiver=${information_data.receiver},province=${information_data.province},district=${information_data.district},ward=${information_data.ward},address=${information_data.address}`;
            try {
                var result;
                switch (req.body.account) {
                    case 'MOMO':
                        result = await axios.post('http://localhost:8080/api/momo', { order_id: docRef.id, momoOrderID: orderID, extraData: extraData });
                        break;
                    case 'ZALOPAY':
                        result = await axios.post('http://localhost:8080/api/zalopay', { order_id: docRef.id, zalopayOrderID: orderID, extraData: extraData });
                        break;
                    case 'PAYPAL':
                        result = await axios.post('http://localhost:8080/api/paypal', { order_id: docRef.id, paypalOrderID: orderID, extraData: extraData });
                        break;
                    case 'CASH':
                        result = await axios.post('http://localhost:8080/api/cash', { order_id: docRef.id, extraData: extraData });
                        break;
                }
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
                for (const order of OrdersArray) 
                    for (const product of order.products) {
                        const result_item = await axios({
                            method: 'GET',
                            url: `http://localhost:8080/api/item/image/${product.code}`
                        });

                        const result_food = await axios({
                            method: 'GET',
                            url: `http://localhost:8080/api/food/image/${product.code}`
                        });

                        if (result_item.data === "Item does not exist")
                            product.image_name = result_food.data;
                        else product.image_name = result_item.data;
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
                    orders.data().shipID,
                    orders.data().products,
                    orders.data().information
                );

                for (const product of order.products) {
                    const result_item = await axios({
                        method: 'GET',
                        url: `http://localhost:8080/api/item/image/${product.code}`
                    });

                    const result_food = await axios({
                        method: 'GET',
                        url: `http://localhost:8080/api/food/image/${product.code}`
                    });

                    if (result_item.data === "Item does not exist")
                        product.image = result_food.data;
                    else product.image = result_item.data;
                }

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
        if (req.params.orderID === undefined) res.send("Missing Order ID value");
        else {
            const order_id = req.params.orderID;

            const orderRef = await firestore.collection("orders").doc(order_id);

            await orderRef.update({
                state: "Đã hủy",
                cancel_time: (new Date()).toString()
            });

            const order = await orderRef.get();

            const receipt = await firestore.collection("receipts").doc(order.data().receiptID).get();

            console.log(receipt.data().ship_details.shipID);
            await axios({
                method: 'POST',
                url: 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel',
                headers: {
                    token: token,
                    shop_id: shop_id
                },
                data: {
                    "order_codes": [receipt.data().ship_details.shipID]
                }
            });

            res.send("Delete Successfully");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getShipState = async (req, res, next) => {
    try {
        if (req.query.orderID === undefined) res.send("Missing Order ID Value");
        else {

        }
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = {
    addOrder,
    getAllOrders,
    getOrder,
    updateOrder,
    deleteOrder,
    getShippingFee,
    getShipState
}