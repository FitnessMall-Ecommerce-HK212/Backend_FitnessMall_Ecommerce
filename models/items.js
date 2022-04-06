class Item {
    constructor(id, code, description, image, name, price, sold, itemtype = [], feedback = []) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.image = image;
        this.name = name;
        this.price = price;
        this.sold = sold;
        this.itemtype = itemtype;
        this.feedback = feedback;
    }
}
module.exports = Item;