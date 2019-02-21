require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const app = express();
const usuarios = require('./routes/usuario');
const projetos = require('./routes/projeto');
const registro = require('./routes/registro');
const config = require('./config');
var morgan = require('morgan');

mongoose.Promise = global.Promise;
mongoose.connect(config.databaseURI, { useCreateIndex: true, useNewUrlParser: true })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err));
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use('/', usuarios);
app.use('/projetos', projetos);
app.use('/registro', registro);
app.listen(config.port, () => {
    console.log("Funcionando! porta:"+config.port)
})
