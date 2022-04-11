'use strict';

const firestore = require('../configure/firestore');
const Blog = require('../models/blogs');
const Comment = require('../models/cmt');
// const addBlog = async (req, res, next) => {
//     try {
//         const data = req.body;
//         await firestore.collection('blogs').doc().set(data); 
//         console.log("AKJ");
//         res.send('Record saved successfuly');
//     } catch (error) {
//         res.status(400).send(error.message);
//         console.log("MNV");
//     }
// }

const getAllBlogs = async (req, res, next) => {
    try {
        const blogs = await firestore.collection('blogs');
        const data = await blogs.get();
        const blogsArray = [];
        if (!data.empty) {
            data.forEach(doc => {
                console.log(doc.id)
                const blog = new Blog({
                    idBlog : doc.id,
                    content: doc.data().content,
                    date: doc.data().date, 
                    image: doc.data().image, 
                    comment: [], 
                    tags: doc.data().tags, 
                    title: doc.data().title, 
                    writer: doc.data().writer
                }
                );
                blogsArray.push(blog);
            });
        }
        console.log(blogsArray);
        res.status(200).send({
            'blogList': blogsArray
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getBlog = async (req, res, next) => {
    try {
        const idDoc = req.params.id;
        const blog = await firestore.collection('blogs').doc(idDoc);
        const data = await blog.get();
        console.log(data);
        if (!data.exists) {
            console.log('data does not exists');

            res.status(404).send('Blog with the given ID not found');
        } else {
            const dataDoc = data.data();
            const cmtList = await getAllComments(idDoc);
            res.status(200).send(new Blog(
                {
                    idBlog: idDoc,
                    content: dataDoc.content,
                    date: dataDoc.date,
                    image: dataDoc.image,
                    tags: dataDoc.tags,
                    title: dataDoc.title,
                    writer: dataDoc.writer,
                    comment: cmtList
                }
            ));

        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllComments = async (id) => {
    const comments = await firestore.collection('blogs').doc(id).collection('cmt').orderBy('date').get();
    const cmtList = [];
    if (comments.empty) {
        console.log(id);
        console.log('empty');
    }
    else {
        
        comments.forEach(doc => {
            const cmt = new Comment({ 
                id: doc.id, 
                content: doc.data().content, 
                date: doc.data().date, 
                username: doc.data().user 
            });
            cmtList.push(cmt);
        })
        console.log(cmtList);
    }

    return cmtList;

}

const addComment = async (req, res, next) => {
    const content = req.body.content;
    const username = req.body.username;
    const blog_id = req.body.blog_id;

    const blog = await firestore.collection('blogs').doc(blog_id);

    if (blog.empty){
        res.status(404).send('Cannot add a comment, try again later');
    }
    else {
        await blog.collection('cmt').add({
            content: content,
            date: new Date(),
            user: username
        });
        res.status(200).send('Add comment successfully');
    }
}

module.exports = {
    getAllBlogs,
    getBlog,
    addComment
}