'use strict';
const express = require('express');

const cookieParser = require('cookie-parser');
const sessions = require('express-session');

const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./configure/config');

const blogsRoutes = require('./routes/blogs-routes');
const foodsRoutes = require('./routes/food-routes');
const informationsRoutes = require('./routes/informations-routes');
const itemsRoutes = require('./routes/items-routes');
const ordersRoutes = require('./routes/orders-routes');
const paymentsRoutes = require('./routes/payment-routes');
const usersRoutes = require('./routes/users-routes');
const verifiedRoutes = require('./routes/verified-routes');

const routes = [
    blogsRoutes,
    foodsRoutes,
    informationsRoutes,
    itemsRoutes,
    ordersRoutes,
    usersRoutes,
    verifiedRoutes,
    paymentsRoutes
];

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

routes.forEach(route => { app.use('/api', route.routes) });

app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));
