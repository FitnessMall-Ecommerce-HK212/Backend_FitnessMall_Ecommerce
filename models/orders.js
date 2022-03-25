class Order {
    constructor(id, username, state,ts,receiptID="",shipcode="") {
        this.id = id;
        this.username = username;
        this.pwd = pwd;
        this.state = state;
        this.ts = ts;
        this.receiptID = receiptID;
        this.shipID = shipID;
    }
}

module.exports = Order;