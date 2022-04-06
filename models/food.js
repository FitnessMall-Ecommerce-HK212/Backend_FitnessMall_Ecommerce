class Food {
    constructor(id, code, description, image, name, price, feedback = []) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.image = image;
        this.name = name;
        this.price = price;
        this.feedback = feedback;
    }
}
module.exports = Food;