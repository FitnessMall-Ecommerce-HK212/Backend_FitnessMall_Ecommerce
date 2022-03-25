'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const studentRoutes = require('./routes/student-routes');
const { addStudent } = require('./controllers/studentController');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/api', studentRoutes.routes);



app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));


// addStudent({body:{"m":4}});