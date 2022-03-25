const firebase = require('firebase');
// const firestore=require('firebase/firestore')
const config = require('./config');
// const firestore = require('./firestore');

const db = firebase.initializeApp(config.firebaseConfig);
// const firestore= firebase.default.firestore(db);
// firestore(db);
// const firestore=firestore();
module.exports = db;