class Feedback {
    constructor(props) {
        const { id, username, content, date, point } = props;
        this.id = id;
        this.content = content;
        this.date = date;
        this.point = point;
        this.username = username;
    }
}

module.exports = Feedback;