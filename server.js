'use strict';
const express = require('express');

const cookieParser = require('cookie-parser');
const sessions = require('express-session');

const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./configure/config');
const studentRoutes = require('./routes/users-routes');
const ordersRoutes = require('./routes/orders-routes');

const app = express();

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "thisissecretkeyoffitnessmall",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cookieParser());

app.use('/api', studentRoutes.routes);
app.use('/api', ordersRoutes.routes);


app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));


// testing connection: 
// const { addStudent } = require('./controllers/studentController');
// const userMiddleware=require('./controllers/usersController');
// addStudent({body:{"m":4}});