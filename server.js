'use strict';
const express = require('express');

const cookieParser = require('cookie-parser');
const sessions = require('express-session');

const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./configure/config');

// const blogsRoutes = require('./routes/blogs-routes');
// const cmtsRoutes = require('./routes/cmt-routes');
// const feedbacksRoutes = require('./routes/feedback-routes');
// const foodsRoutes = require('./routes/food-routes');
const informationsRoutes = require('./routes/informations-routes');
// const itemsRoutes = require('./routes/items-routes');
// const itemTypeRoutes = require('./routes/itemtype-routes copy');
const ordersRoutes = require('./routes/orders-routes');
// const productsRoutes = require('./routes/product-routes');
// const receiptsRoutes = require('./routes/receipts-routes');
const usersRoutes = require('./routes/users-routes');
const verifiedRoutes = require('./routes/verified-routes');

const routes = [
    // blogsRoutes,
    // cmtsRoutes,
    // feedbacksRoutes,
    // foodsRoutes,
    informationsRoutes,
    // itemsRoutes,
    // itemTypeRoutes,
    ordersRoutes,
    // productsRoutes,
    // receiptsRoutes,
    usersRoutes,
    verifiedRoutes
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
// app.use('/api', studentRoutes.routes);
// app.use('/api', ordersRoutes.routes);


app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));


// testing connection: 
// const { addStudent } = require('./controllers/studentController');
// const userMiddleware=require('./controllers/usersController');
// addStudent({body:{"m":4}});