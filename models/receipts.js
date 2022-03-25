class Receipt {
    constructor(id, username, account, amount, ts) {
        this.id = id;
        this.account = account;
        this.amount = amount;
        this.ts = ts;
        this.username = username;
        // information is an array of Info
    }
}

module.exports = Receipt;