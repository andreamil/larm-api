require('dotenv').config();
const express = require("express");
const app = express(),
   path = require('path'),
   fs = require('fs');;
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
var staticRoot = __dirname + '/public/';
require('./socket')(http);
require('./porta');
mongoose.connect(config.databaseURI, { useCreateIndex: true, useNewUrlParser: true })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err));
app.use(cors());
app.use(bodyParser.json());

// app.get('/', (req, res, next) => {
//     //res.send('ads')
//     res.sendFile(__dirname + '/index.html');
// });
app.use(morgan('combined'));
app.use('/usuarios', usuarios);
app.use('/projetos', projetos);
app.use('/registro', registro);

app.use(function(req, res, next) {
    //if the request is not html then move along
    var accept = req.accepts('html', 'json', 'xml');
    if (accept !== 'html') {
        return next();
    }

    // if the request has a '.' assume that it's for a file, move along
    var ext = path.extname(req.path);
    if (ext !== '') {
        return next();
    }

    fs.createReadStream(staticRoot + 'index.html').pipe(res);

});

app.use(express.static(staticRoot));

http.listen(config.port, () => {
    console.log("Funcionando! porta:"+config.port)
})


