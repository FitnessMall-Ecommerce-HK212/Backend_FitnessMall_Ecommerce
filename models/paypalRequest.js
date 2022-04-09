const { default: axios } = require('axios');
const { paypal_client_id, secret } = require('../configure/paypal');

class PaypalRequest {
    static async generateAccesstoken() {
        const auth = Buffer.from(paypal_client_id + ":" + secret).toString("base64");
        const response = await axios({
            method: "post",
            url: `${base}/v1/oauth2/token`,
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        const data = await response.json();
        return data.access_token;
    }
}

module.exports = PaypalRequest;