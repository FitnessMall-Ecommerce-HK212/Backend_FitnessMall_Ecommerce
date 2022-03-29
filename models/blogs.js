class Blog {
    constructor(props) {
        const {idBlog, content, date, image, comment, tags, title, writer} = props;
        this.idBlog = idBlog;
        this.comment = comment;
        this.content = content;
        this.date = date;
        this.image = image;
        this.tags = tags;
        this.title = title;
        this.writer = writer;
    }
}

module.exports = Blog;