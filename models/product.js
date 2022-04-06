class Product {
    constructor(id, code, itemtype, quantity, unit_price) {
        this.id = id;
        this.code = code;
        this.itemtype = itemtype;
        this.quantity = quantity;
        this.unit_price = unit_price;
    }
}

module.exports = Product;