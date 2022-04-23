class Food {
    constructor(id, code, description, image, itemtype, name, point, feedback, price) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.itemtype = itemtype;
        this.image = image;
        this.name = name;
        this.point = point;
        this.feedback = feedback;
        this.price = price;
    }
}
module.exports = Food;