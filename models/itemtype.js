class ItemType {
    constructor(props) {
        const { id, category, price, quantity } = props;
        this.id = id;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
    }
}

module.exports = ItemType;