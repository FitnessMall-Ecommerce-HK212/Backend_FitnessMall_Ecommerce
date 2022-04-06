class Order {
    constructor(id, username, timestamp, state, amount, receiptID, shipID = "", products = []) {
        this.id = id;
        this.username = username;
        this.timestamp = timestamp;
        this.state = state;
        this.amount = amount;
        this.receiptID = receiptID;
        this.shipID = shipID;
        this.products = products;
    }
}

module.exports = Order;