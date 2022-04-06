'use strict';

const firestore = require('../configure/firestore');
const Cmt = require('../models/users');
const addCmt = async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('cmt').doc().set(data); 
        console.log("AKJ");
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);
        console.log("MNV");
    }
}

// const getAllCmts = async (req, res, next) => {
//     try {
//         //TODO edit collection path through blogs
//         const cmt = await firestore.collection('cmt');
//         const data = await cmt.get();
//         const cmtArray = [];
//         if(data.empty) {
//             res.status(404).send('No cmt record found');
//         }else {
//             data.forEach(doc => {
//                 const cmt = new Cmt(
//                     doc.id,
//                     doc.data().content,
//                     doc.data().date,
//                     doc.data().user
//                 );
//                 cmtArray.push(cmt);
//             });
//             res.send(cmtArray);
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }

const getCmt = async (req, res, next) => {
    try {
        const id = req.params.id;
        const cmt = await firestore.collection('cmt').doc(id);
        const data = await cmt.get();
        if(!data.exists) {
            res.status(404).send('Cmt with the given ID not found');
        }else {
            res.send(data.data());
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateCmt = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const cmt =  await firestore.collection('cmt').doc(id);
        await cmt.update(data);
        res.send('Cmt record updated successfuly');        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteCmt = async (req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('cmt').doc(id).delete();
        res.send('Record deleted successfuly');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addCmt,
    getAllCmts,
    getCmt,
    updateCmt,
    deleteCmt
}