'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./configure/config');
const studentRoutes = require('./routes/user-routes');const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/api', studentRoutes.routes);



app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));


// testing connection: 
// const { addStudent } = require('./controllers/studentController');
// const userMiddleware=require('./controllers/usersController');
// addStudent({body:{"m":4}});