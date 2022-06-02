'use strict';

// Third Party
const firestore = require('../configure/firestore');
const momoConfig = require('../configure/momo');
const { token, shop_id, client_id } = require('../configure/GHN');
const { appId, key1, key2 } = require('../configure/zalopay');
const { sandbox_account, paypal_client_id, secret, access_token } = require('../configure/paypal');
const sendEmail = require('./verifiedController').sendEmail;
// Modules
const axios = require('axios');
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment

// Models
const MoMoRequest = require('../models/momoRequest');
const PaypalRequest = require('../models/paypalRequest');

// Utils
const { normalize } = require('../utils/string_utils');

function createOrderSuccessNotify(props) {
    const { email, orderId, productList, username } = props

    var emailTemplate = `<h5>Chào ${username}</h5>
    <div>Fitness mall đã nhận được yêu cần đặt hàng của bạn</div>
    <div>Đơn hàng của bạn gồm:</div>
    <table>
        <tr>
            <th>Tên sản phẩm</th>
            <th>Đơn giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
        </tr>
    `;

    productList.forEach((item) => {
        const itemTemplate = `
        <tr>
            <td>${item.name}</td>
            <td>${item.unit_price}</td>
            <td>${item.quantity}</td>
            <td>${item.unit_price * item.quantity}</td>
        </tr>
        `;
        emailTemplate += itemTemplate;
    });

    emailTemplate += '</table>';
    // console.log('[INFO] Email template:' + emailTemplate);
    sendEmail('fitness-maill@gmail.com', 'Xác nhận đặt hàng thành công', emailTemplate, email);
    // console.log('[INFO] Send email notification successfully');
}

async function createGHNorder(props) {
    const { information } = props;

    const province = await axios({
        method: 'GET',
        url: `${process.env.HOST_URL}api/infos/province`
    });

    const province_inform = province.data.filter(pro => normalize(pro.province_name) === normalize(information.province));

    const district = await axios({
        method: 'GET',
        url: `${process.env.HOST_URL}api/infos/district`,
        params: {
            province_id: province_inform[0].province_id
        }
    });

    const district_inform = district.data.filter(dis => normalize(dis.district_name) === normalize(information.district));

    const ward = await axios({
        method: 'GET',
        url: `${process.env.HOST_URL}api/infos/ward`,
        params: {
            district_id: district_inform[0].district_id
        }
    });

    const ward_inform = ward.data.filter(war => normalize(war.ward_name) === normalize(information.ward));

    const service_inform = await axios({
        method: 'GET',
        url: `${process.env.HOST_URL}api/infos/service`,
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

    console.log(body);

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
        appid: appId,
        key1: key1,
        key2: key2,
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
    try {
        const base = "https://api-m.sandbox.paypal.com";
        const accessToken = await PaypalRequest.generateAccesstoken();
        console.log(accessToken);

        // const orderId = req.body.order_id;
        // const paypalOrderId = req.body.paypalOrderID;
        // const extraData = req.body.extraData;

        // const orderSnapshot = await firestore.collection('orders').doc(orderId);
        // const order = await orderSnapshot.get();
        // const data = order.data();

        // const receiptSnapshot = await firestore.collection("receipts").doc(data.receiptID).get();
        // const total_amount = receiptSnapshot.data().total_amount;

        const result = await axios({
            method: 'POST',
            url: `${base}/v2/checkout/orders`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            },
            data: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: "100.00",
                        },
                    },
                ],
            })
        });

        console.log(result.data);
    } catch (e) {
        res.status(500).send(e);
    }
}

const cashPayment = async (req, res, next) => {
    try {

        const orderId = req.body.order_id;

        console.log(orderId);

        const extraData = req.body.extraData;

        const order = await firestore.collection('orders').doc(orderId).get();
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
        
        var orderid, username, order_details;
        orderid = orderId;
        username = order.data().username;
        order_details = order.data().products

        const user = await firestore.collection("users").where("username", "==", username).get();
        var email;

        user.forEach(doc => {
            email = doc.data().email;
        })

        createOrderSuccessNotify({
            username: username,
            email: email,
            orderId: orderid,
            productList: order_details
        })

        res.send(process.env.FRONTEND_URL);
    } catch (e) {
        console.log(e.message);
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

        console.log(information);
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
        
        var orderid, username, order_details;
        order.forEach(doc => {
            orderid = doc.id;
            username = doc.data().username;
            order_details = doc.data().products
        })
        
        if (result_code === "0") {

            const user = await firestore.collection("users").where("username", "==", username).get();
            var email;

            user.forEach(doc => {
                email = doc.data().email;
            })

            createOrderSuccessNotify({
                username: username,
                email: email,
                orderId: orderid,
                productList: order_details
            })
        }

        await firestore.collection("orders").doc(orderid).update({
            state: result_code === "0" ? "Đã thanh toán" : "Đã hủy"
        })

        res.send(`<script> window.location.href = "${process.env.FRONTEND_URL}"</script>`);
    } catch (e) {
        console.log(e.message);
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