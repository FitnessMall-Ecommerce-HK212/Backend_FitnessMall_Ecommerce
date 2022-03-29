class Comment {
    constructor(props) {
            const {id,content, date, username} = props;
            this.id = id;
            this.content = content;
            this.date = date;
            this.username = username;
    }
}

module.exports = Comment;