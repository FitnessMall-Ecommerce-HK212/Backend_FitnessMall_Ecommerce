// module.exports = {
//     partner_code: 'MOMOLMUK20220329',
//     access_key: 'sUt5iGdZZvToGm8p',
//     secret_key: '3rQb08iEYuidDOt3HpVtoESkrDUIjFKf',
//     endpoint: 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
//     url: 'https://test-payment.momo.vn',
//     redirectUrl: 'https://momo.vn/return',
//     ipnUrl: 'https://callback.url/notify',
//     m4b_account: {
//         username: 'ecomm_hcmut',
//         password: 'ecomm@hcmut2019'
//     },
//     connection: {
//         url: 'https://test-payment.momo.vn/v2/gateway/api/create',
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json; charset=UTF-8'
//         }
//     }
// };

module.exports = {
    partner_code: 'MOMOLMUK20220329',
    access_key: 'sUt5iGdZZvToGm8p',
    secret_key: '3rQb08iEYuidDOt3HpVtoESkrDUIjFKf',
    url: 'https://test-payment.momo.vn',
    redirectUrl: `${process.env.HOST_URL}api/momo/check_payment`,
    ipnUrl: 'https://callback.url/notify',
    m4b_account: {
        username: 'ecomm_hcmut',
        password: 'ecomm@hcmut2019'
    },
    connection: {
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        method: 'POST'
    }
};