const axios = require('axios');
const firestore = require('../configure/firestore');

const MoMoRequest = require('../models/momoRequest');
const momoConfig = require('../configure/momo');
const { token, shop_id, client_id } = require('../configure/GHN');

const momoPayment = async (req, res, next) => {
    const orderId = req.body.order_id;
    const momoOrderId = req.body.momoOrderID;
    const extraData = req.body.extraData;

    const orderSnapshot = await firestore.collection('orders').doc(orderId);
    const order = await orderSnapshot.get();
    const data = order.data();

    const momoRequest = new MoMoRequest({
        amount: data.amount,
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
            // console.log(momo_res.data);
            res.send(momo_res.data.payUrl);
        }
    } catch (e) {
        res.status(500).send(e.message);
    }

}

async function createGHNorder(props) {
    const { information } = props;

    const province = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/province'
    });

    const province_inform = province.data.filter(pro => pro.province_name.toString() === information.province.toString());
    
    const district = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/district',
        params: {
            province_id: province_inform[0].province_id
        }
    });

    const district_inform = district.data.filter(dis => {
        return dis.district_name.toString() === information.district.toString()
    });
    
    const ward = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/ward',
        params: {
            district_id: district_inform[0].district_id
        }
    });

    const ward_inform = ward.data.filter(war => war.ward_name = information.ward);

    const service_inform = await axios({
        method: 'GET',
        url: 'http://localhost:8080/api/infos/service',
        params: {
            district_id: district_inform[0].district_id
        }
    });

    // console.log(service_inform);
    const body = {
        "to_name": information.receiver,
        "to_phone": information.phone,
        "to_address": information.address + ", " + information.ward + ", " + information.district + ", " + information.province,
        "to_ward_code": ward_inform[0].ward_code,
        "to_district_id": district_inform[0].district_id,
        "weight": 20,
        "length": 30,
        "width": 40,
        "height": 50,
        "cod_amount": parseInt(information.amount.split("'")[1]),
        "service_type_id": service_inform.data.service_type_id,
        "service_id": service_inform.data.service_id,
        "payment_type_id": 2,
        "required_note": "KHONGCHOXEMHANG",
        "Items": [
    
        ]
    }

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
            expectedDeliveryTime: result.data.data.expected_delivery_time
        }
    } else {
        return {
            message: "Something went wrong. Please try again later"
        }
    }
}

const checkPaymentMoMo = async (req, res, next) => {
    try {
        var information = { amount: req.query.amount };
        const extraData = req.query.extraData;
        const result_code = req.query.resultCode;
        const momoOrderID = req.query.orderId;

        extraData.substring(1, extraData.length - 1).split(',').forEach(field => {
            const arr_field = field.split('=');
            information = {
                ...information,
                [arr_field[0]] : arr_field[1]
            }
        });

        createGHNorder({ information });

        // const receipt = await firestore.collection("receipts").where("momoOrderID", "==", momoOrderID).get();

        // var id;
        // receipt.forEach(doc => {
        //     id = doc.id;
        // });

        // await firestore.collection("receipts").doc(id).update({
        //     state: result_code === "0" ? "Đã thanh toán" : "Đã hủy"
        // })

        // const order = await firestore.collection("orders").where("receiptID", "==", id).get();

        // var orderid;
        // order.forEach(doc => {
        //     orderid = doc.id;
        // })

        // await firestore.collection("orders").doc(orderid).update({
        //     state: result_code === "0" ? "Đang giao hàng" : "Đã hủy"
        // })
        res.status(200).send("Kiểm tra đơn hàng thành công");
    } catch (e) {
        res.status(500).send(e);
    }
}

const deleteR = async (req, res, next) => {
    const orders = await firestore.collection("orders").where("username", "==", "giacat").get();
    orders.forEach(async order => {
        await firestore.collection("receipts").doc(order.data().receiptID).delete();
        // await firestore.collection("orders").doc(order.id).collection("information").delete();
        // await firestore.collection("orders").doc(order.id).collection("products").delete();
        // await firestore.collection("orders").doc(order.id).delete();
    });

    res.send("Successfully");
}

module.exports = {
    momoPayment,
    checkPaymentMoMo,
    deleteR
};