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
var morgan = require('morgan')

    mongoose.Promise = global.Promise;
    mongoose.connect(config.databaseURI).then(() => console.log('MongoDB Connected...'))
                                        .catch(err => console.log(err));

    app.use(cors());
    app.use(bodyParser.json());
    app.use(morgan('combined'))

    app.use('/auth', users);
    app.use('/projetos', projetos);

app.listen(config.port, () => {
    console.log("Up and Running! porta:"+config.port)
})
