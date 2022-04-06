'use strict';

const firestore = require('../configure/firestore');

const Product = require('../models/product');
const addProduct = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('products').doc().set(data); 
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllProducts = async (req, res, next) => {
    try {
        const Products = await firestore.collection('Products');
        const data = await Products.get();
        const ProductsArray = [];
        if(data.empty) {
            res.status(404).send('No Product record found');
        }else {
            data.forEach(doc => {
                const Product = new Product(
                    doc.id,
                    doc.data().code,
                    getItemType(doc.data().getItemType),//TODO: get id -> get ItemType() 
                    doc.data().quantity
                );
                ProductsArray.push(Product);
            });
            res.send(ProductsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const Product = await firestore.collection('Products').doc(id);
        const data = await Product.get();
        if(!data.exists) {
            res.status(404).send('Product with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const Product =  await firestore.collection('Products').doc(id);
        await Product.update(data);
        res.send('Product record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('Products').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
}