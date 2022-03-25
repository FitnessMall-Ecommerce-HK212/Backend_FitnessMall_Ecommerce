const firebase = require('firebase');
const config = require('./config');

const db = firebase.initializeApp(config.firebaseConfig);
// const firestore=require('firebase/firestore')
// const firestore = require('./firestore');
// const firestore= firebase.default.firestore(db);
// firestore(db);
// const firestore=firestore();
module.exports = db;