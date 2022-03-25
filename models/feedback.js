class Feedback {
    constructor(id,username,content, date, point) {
            this.id = id;
            this.content = content;
            this.date = date;
            this.point = point;
            this.username=username;
    }
}

module.exports = Feedback;