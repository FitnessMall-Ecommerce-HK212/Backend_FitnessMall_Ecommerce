const axios = require('axios');
const firestore = require('../configure/firestore');

const MoMoRequest = require('../models/momoRequest');
const momoConfig = require('../configure/momo');

const momoPayment = async (req, res, next) => {
    const orderId = req.body.order_id;
    const momoOrderId = req.body.momoOrderID;

    const orderSnapshot = await firestore.collection('orders').doc(orderId);
    const order = await orderSnapshot.get();
    const data = order.data();

    const momoRequest = new MoMoRequest({
        amount: data.amount,
        username: data.username,
        orderId: momoOrderId
    });
    const body = JSON.stringify(momoRequest);
    const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body)
    }
    try {
        const momo_res = await axios({
            method: 'post',
            url: momoConfig.connection.url,
            data: body,
            headers: headers
        });
        if (momo_res.data.resultCode === 0) {
            // console.log(momo_res.data);
            res.send(momo_res.data);
        }
    } catch (e) {
        res.status(500).send(e.message);
    }

}

const checkPayment = async (req, res, next) => {
    try {
        const result_code = req.query.resultCode;
        const momoOrderID = req.query.orderId;

        const receipt = await firestore.collection("receipts").where("momoOrderID", "==", momoOrderID).get();

        var id;
        receipt.forEach(doc => {
            id = doc.id;
        });

        await firestore.collection("receipts").doc(id).update({
            state: result_code === "0" ? "Đã thanh toán" : "Đã hủy"
        })

        const order = await firestore.collection("orders").where("receiptID", "==", id).get();

        var orderid;
        order.forEach(doc => {
            orderid = doc.id;
        })

        await firestore.collection("orders").doc(orderid).update({
            state: result_code === "0" ? "Đang giao hàng" : "Đã hủy"
        })
        res.status(200).send("Kiểm tra đơn hàng thành công");
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = {
    momoPayment,
    checkPayment
};