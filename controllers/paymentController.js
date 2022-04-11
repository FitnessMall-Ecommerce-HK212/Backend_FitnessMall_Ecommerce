const axios = require('axios');
const firestore = require('../configure/firestore');

const MoMoRequest = require('../models/momoRequest');
const momoConfig = require('../configure/momo');

const momoPayment = async (req, res, next) => {
    const orderId = req.body.order_id;
    const orderSnapshot = await firestore.collection('orders').doc(orderId);
    const order = await orderSnapshot.get();
    const data = order.data();

    const momoRequest = new MoMoRequest({
        amount: data.amount,
        username: data.username,
        orderId: orderId
    });
    const body = JSON.stringify(momoRequest);
    console.log('REQUEST TO MOMO: '+body);
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
            console.log("MOMO'S RESPONSE: " + JSON.stringify(momo_res.data));
            res.redirect(momo_res.data.payUrl);
            orderSnapshot.set({'state': 'Đã thanh toán'},  { merge: true })
        }
    }catch(e){
        console.log(e);
        res.status(500).send("Something's wrong, please try again later");
    }
    
}

module.exports = momoPayment;