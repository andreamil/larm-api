const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require('cors');
const passport = require("passport");
const mongoose = require('mongoose');
const app = express();
const users = require('./routes/user');
const projetos = require('./routes/projeto');
const config = require('./config');
const jwt = require("jsonwebtoken");
// Loading Protect Route Helper
const {verifyToken} = require('./helper/protectRoute');


// Setup
    // Mongoose ODM config
        mongoose.Promise = global.Promise;
        mongoose.connect(config.databaseURI).then(() => console.log('MongoDB Connected...'))
            .catch(err => console.log(err));
    // CORS Middleware
        app.use(cors());
        /*app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });*/
    // Body Parser Middleware
        app.use(bodyParser.json());
    // Default Route
    /*app.get('/', (req, res) => {
        res.json({msg: 'Invalid Endpoint'})
    })*/

// Routes
    app.use('/auth', users);
    app.use('/projetos', projetos);





app.listen(config.port, () => {
    console.log("Up and Running! porta:"+config.port)
})
