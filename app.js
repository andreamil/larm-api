require('dotenv').config();
const express = require("express");
const app = express();
const http = require('http').Server(app);
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const usuarios = require('./routes/usuario');
const projetos = require('./routes/projeto');
const registro = require('./routes/registro');
const config = require('./config');
var morgan = require('morgan');

require('./socket')(http);
require('./porta');
mongoose.connect(config.databaseURI, { useCreateIndex: true, useNewUrlParser: true })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err));
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
// app.get('/', (req, res, next) => {
//     //res.send('ads')
//     res.sendFile(__dirname + '/index.html');
// });
app.use(morgan('combined'));
app.use('/usuarios', usuarios);
app.use('/projetos', projetos);
app.use('/registro', registro);
http.listen(config.port, () => {
    console.log("Funcionando! porta:"+config.port)
})


