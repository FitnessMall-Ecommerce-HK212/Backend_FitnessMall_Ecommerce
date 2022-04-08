const momoConfig = require('../configure/momo');
const momo_utils = require('../utils/momo_utils');
const hmac_sha256 = require('crypto-js/hmac-sha256');
const crypto = require('crypto');

class MomoRequest {
    constructor(props){
        const {amount, username, orderId, extraData} = props;

        this.partnerCode = momoConfig.partner_code;
        this.partnerName = 'Fitness Mall';
        this.storeId = 'Fitness Mall';
        this.requestId = momo_utils.createRequestId(username);
        this.amount = amount;
        this.orderId = orderId;
        this.orderInfo = 'FITNESS';
        this.redirectUrl = momoConfig.redirectUrl;
        this.requestType = 'captureWallet';
        this.extraData = `${extraData}`;
        this.lang = 'vi';
        this.ipnUrl = momoConfig.ipnUrl;
        this.signature = this.generateSignature();
    }

    generateSignature(){
        const rawSignature = `accessKey=${momoConfig.access_key}&amount=${this.amount}&extraData=${this.extraData}&ipnUrl=${this.ipnUrl}&orderId=${this.orderId}&orderInfo=${this.orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${this.requestId}&requestType=${this.requestType}`
        // console.log('--------RAW SIGNATURE------------');
        // console.log(rawSignature);
        const signature_ = crypto.createHmac('sha256', momoConfig.secret_key).update(rawSignature).digest('hex');
        return signature_;
    }
}

module.exports = MomoRequest;