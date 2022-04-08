const axios = require('axios');
const firestore = require('../configure/firestore');

const MoMoRequest = require('../models/momoRequest');
const momoConfig = require('../configure/momo');
const { token, shop_id, client_id } = require('../configure/GHN');
const { normalize } = require('../utils/string_utils');

const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment

async function createGHNorder(props) {
    const { information } = props;

    const province = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/province'
    });

    const province_inform = province.data.filter(pro => normalize(pro.province_name) === normalize(information.province));

    const district = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/district',
        params: {
            province_id: province_inform[0].province_id
        }
    });

    const district_inform = district.data.filter(dis => normalize(dis.district_name) === normalize(information.district));

    const ward = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/ward',
        params: {
            district_id: district_inform[0].district_id
        }
    });

    const ward_inform = ward.data.filter(war => normalize(war.ward_name) === normalize(information.ward));

    const service_inform = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/service',
        params: {
            district_id: district_inform[0].district_id
        }
    });

    const body = {
        "to_name": information.receiver,
        "to_phone": information.phone,
        "to_address": information.address + ", " + information.ward + ", " + information.district + ", " + information.province,
        "to_ward_code": ward_inform[0].ward_code,
        "to_district_id": district_inform[0].district_id,
        "weight": 20,
        "length": 30,
        "width": 40,
        "height": 10,
        "cod_amount": parseInt(information.amount.split("'")[1]),
        "service_type_id": service_inform.data.service_type_id,
        "service_id": service_inform.data.service_id,
        "payment_type_id": information.payment_type_id,
        "required_note": "KHONGCHOXEMHANG",
        "Items": [

        ]
    }

    // console.log(body);

    const result = await axios({
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'token': token,
            'shop_id': shop_id
        },
        url: "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
        data: {
            ...body
        }
    });

    if (result.data.code === 200) {
        return {
            message: result.data.code_message_value,
            shipID: result.data.data.order_code,
            expectedDeliveryTime: result.data.data.expected_delivery_time,
            total_fee: result.data.data.total_fee
        }
    } else {
        return {
            message: "Something went wrong. Please try again later"
        }
    }
}

const momoPayment = async (req, res, next) => {
    const orderId = req.body.order_id;
    const momoOrderId = req.body.momoOrderID;
    const extraData = req.body.extraData;

    const orderSnapshot = await firestore.collection('orders').doc(orderId);
    const order = await orderSnapshot.get();
    const data = order.data();

    const receiptSnapshot = await firestore.collection("receipts").doc(data.receiptID).get();
    const total_amount = receiptSnapshot.data().total_amount;

    const momoRequest = new MoMoRequest({
        amount: total_amount,
        username: data.username,
        orderId: momoOrderId,
        extraData: extraData
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
            res.send(momo_res.data.payUrl);
        }
    } catch (e) {
        res.status(500).send(e.message);
    }

}

const zalopayPayment = async (req, res, next) => {
    const orderId = req.body.order_id;
    const zalopayOrderId = req.body.zalopayOrderID;
    const extraData = req.body.extraData;

    const orderSnapshot = await firestore.collection('orders').doc(orderId);
    const order = await orderSnapshot.get();
    const data = order.data();

    const receiptSnapshot = await firestore.collection("receipts").doc(data.receiptID).get();
    const total_amount = receiptSnapshot.data().total_amount;

    const config = {
        appid: "554",
        key1: "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn",
        key2: "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny",
        endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder"
    };

    var embeddata = {
        amount: "'0'"
    };

    extraData.split(',').forEach(field => {
        const arr_field = field.split('=');
        embeddata = {
            ...embeddata,
            [arr_field[0]]: arr_field[1]
        }
    });

    embeddata.payment_type_id = 1;

    const items = [];

    const order_inform = {
        appid: config.appid,
        apptransid: `${moment().format('YYMMDD')}_${zalopayOrderId}`, // mã giao dich có định dạng yyMMdd_xxxx
        appuser: data.information.receiver,
        apptime: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embeddata: JSON.stringify(embeddata),
        amount: total_amount,
        description: `Fitness Mall - Thanh toán cho đơn hàng #${zalopayOrderId}`,
        bankcode: "zalopayapp",
    };

    const zalopay_data = config.appid + "|" + order_inform.apptransid + "|" + order_inform.appuser + "|" + order_inform.amount + "|" + order_inform.apptime + "|" + order_inform.embeddata + "|" + order_inform.item;
    order_inform.mac = CryptoJS.HmacSHA256(zalopay_data, config.key1).toString();

    axios.post(config.endpoint, null, { params: order_inform })
        .then(result => {
            res.send(result.data.orderurl);
        })
        .catch(err => console.log(err));
}

const paypalPayment = async (req, res, next) => {

}

const cashPayment = async (req, res, next) => {
    try {
        const orderId = req.body.order_id;
        const extraData = req.body.extraData;

        const orderSnapshot = await firestore.collection('orders').doc(orderId);
        const order = await orderSnapshot.get();
        const data = order.data();

        const receiptSnapshot = await firestore.collection("receipts").doc(data.receiptID).get();
        const total_amount = receiptSnapshot.data().total_amount;

        var information = { amount: `'${total_amount}'` };
        extraData.split(',').forEach(field => {
            const arr_field = field.split('=');
            information = {
                ...information,
                [arr_field[0]]: arr_field[1]
            }
        });

        information.payment_type_id = 2;

        const ship_details = await createGHNorder({ information });

        await firestore.collection("receipts").doc(data.receiptID).update({
            ship_details: ship_details
        });

        res.status(200).send("http://localhost:3000/");
    } catch (e) {
        res.status(500).send(e);
    }
}

const checkPaymentMoMo = async (req, res, next) => {
    try {
        var information = { amount: "'0'" };
        const extraData = req.query.extraData;

        const result_code = req.query.resultCode;
        const momoOrderID = req.query.orderId;

        extraData.split(',').forEach(field => {
            const arr_field = field.split('=');
            information = {
                ...information,
                [arr_field[0]]: arr_field[1]
            }
        });

        information.payment_type_id = 1;

        var ship_details = {};

        result_code === "0" ? ship_details = await createGHNorder({ information }) : 0;

        const receipt = await firestore.collection("receipts").where("momoOrderID", "==", momoOrderID).get();

        var id;
        receipt.forEach(doc => {
            id = doc.id;
        });

        await firestore.collection("receipts").doc(id).update({
            state: result_code === "0" ? "Đã thanh toán" : "Đã hủy",
            ship_details: ship_details
        })

        const order = await firestore.collection("orders").where("receiptID", "==", id).get();

        var orderid;
        order.forEach(doc => {
            orderid = doc.id;
        })

        await firestore.collection("orders").doc(orderid).update({
            state: result_code === "0" ? "Đã thanh toán" : "Đã hủy"
        })
        res.redirect('http://localhost:3000/');
    } catch (e) {
        res.status(500).send(e);
    }
}

const checkPaymentZalopay = async (req, res, next) => {

}

const checkPaymentPaypal = async (req, res, next) => {

}

module.exports = {
    momoPayment,
    zalopayPayment,
    paypalPayment,
    cashPayment,
    checkPaymentMoMo,
    checkPaymentZalopay,
    checkPaymentPaypal
};