'use strict';

const firestore = require('../configure/firestore');
const Blog = require('../models/users');
const addBlog = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('blogs').doc().set(data); 
        console.log("AKJ");
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
        console.log("MNV");
    }
}

const getAllBlogs = async (req, res, next) => {
    try {
        const blogs = await firestore.collection('blogs');
        const data = await blogs.get();
        const blogsArray = [];
        if(data.empty) {
            res.status(404).send('No blog record found');
        }else {
            data.forEach(doc => {
                const blog = new Blog(
                    doc.id,
                    doc.data().content,
                    doc.data().date,
                    doc.data().image,
                    getAllCmt(doc.collection("/cmt")),
                    doc.data().tags,
                    doc.data().title,
                    doc.data().writer
                );
                blogsArray.push(blog);
            });
            res.send(blogsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getBlog = async (req, res, next) => {
    try {
        const id = req.params.id;
        const blog = await firestore.collection('blogs').doc(id);
        const data = await blog.get();
        if(!data.exists) {
            res.status(404).send('Blog with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateBlog = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const blog =  await firestore.collection('blogs').doc(id);
        await blog.update(data);
        res.send('Blog record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteBlog = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('blogs').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addBlog,
    getAllBlogs,
    getBlog,
    updateBlog,
    deleteBlog
}