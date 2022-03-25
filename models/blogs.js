class Blog {
    constructor(id, content, date, image, comment,tags,title,writer ) {
            this.id = id;
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