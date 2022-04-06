const axios = require('axios');
const firestore = require('../configure/firestore');

const MoMoRequest = require('../models/momoRequest');
const momoConfig = require('../configure/momo');
const uuid = require('uuid');

const momoPayment = async (req, res, next) => {
    const orderId = req.body.order_id;
    const orderSnapshot = await firestore.collection('orders').doc(orderId);
    const order = await orderSnapshot.get();
    const data = order.data();
    const momoRequest = new MoMoRequest({
        amount: data.amount,
        username: data.username,
        orderId: uuid.v1()
    });
    const body = JSON.stringify(momoRequest);
    const headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body)
    }
    try{
        const momo_res = await axios({
            method: 'post',
            url: momoConfig.connection.url,
            data: body,
            headers: headers
        });
        if (momo_res.data.resultCode === 0){
            res.send(momo_res.data);
            // res.redirect(momo_res.data.payUrl);
        }
    }catch(e){
        res.status(500).send(e.message);
    }
    
}

module.exports = momoPayment;