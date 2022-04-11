'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./configure/config');
// const studentRoutes = require('./routes/users-routes');
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/api/payment', require('./routes/payment-routes'));
app.use('/api/order', require('./routes/orders-routes'));
app.use('/api/item', require('./routes/items-routes'));
app.use('/api/blogs', require('./routes/blogs-routes'));



app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));


// testing connection: 
// const { addStudent } = require('./controllers/studentController');
// const userMiddleware=require('./controllers/usersController');
// addStudent({body:{"m":4}});