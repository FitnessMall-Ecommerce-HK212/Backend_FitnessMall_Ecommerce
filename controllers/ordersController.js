'use strict';

const firestore = require('../configure/firestore');

const Order = require('../models/orders');
const md5 = require('md5');

const addOrder = async (req, res, next) => {
    try {
        const logistics_interface = `{
            "eccompanyid": "CUSMODEL",
            "customerid": "084LC012345",
            "txlogisticid": "293442970",
            "ordertype": 1,
            "servicetype": 1,
            "selfAddress": 1,
            "partsign": "0",
            "sender": {
                "name": "WangLei",
                "phone": "0965823123",
                "mobile": "0965823123",
                "prov": "Hồ Chí Minh",
                "city": "Quận 1",
                "area": "Phường Bến Nghé-028QQ101",
                "address": "Phường Bến Nghé, Quận 1,Tp. Hồ Chí Minh"
            },
            "receiver": {
                "name": "Yuliyanti",
                "phone": "0974732123",
                "mobile": "0965823123",
                "prov": "Hà Nội",
                "city": "Huyện Ba Vì",
                "area": "Thị trấn Tây Đằng-024HBV01",
                "address": "4001. Thị trấn Tây Đằng"
            },
            "createordertime": "2018-06-19 18:16:20",
            "sendstarttime": "2018-06-19 18:16:20",
            "sendendtime": "2018-06-19 18:16:20",
            "paytype": "PP_PM",
            "itemsvalue": "20000",
            "goodsvalue": "20000",
            "isInsured": "1",
            "items": [
                {
                    "itemname": "Tên hàng hóa",
                    "englishName": "Tapestry",
                    "number": "1",
                    "itemvalue": "5000",
                    "desc": "Tapestry"
                }
            ],
            "weight": "5.8",
            "volume": "6",
            "remark": "Không cho xem hàng"
        }`;
        const key = '04fc653c0f661e1204bd804774e01824';

        const data_digest = md5(Buffer.from(logistics_interface + key).toString('base64'));
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