class Item {
    constructor(props) {
        const { id, code, description, itemtype, feedback, image, name } = props;
        this.id = id;
        this.code = code;
        this.description = description;
        this.itemtype = itemtype;
        // itemtype is array of itemType
        this.feedback = feedback;
        this.image = image;
        this.name = name;
    }
}
module.exports = Item;