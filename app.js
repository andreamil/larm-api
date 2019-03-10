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
var staticRoot = __dirname + '/../larm-web/dist/';
const jwt = require('jsonwebtoken');
var io = require('socket.io')(http);
    io.on('connection', socket => {
        //jwt.verify(socket.handshake.query.token, config.secret,(err,decoded)=>{
          //  if(err){
         //   console.log(`Socket ${socket.id} has connected (erro ou não autenticado) ${socket.handshake.query.token}`);
         //   socket.emit('autorizado',false);
         //   socket.disconnect();
         //   }
         //   else{
                //socket.emit('autorizado',true);
                socket.on('check autorizado', (token) => {
                    jwt.verify(token, config.secret,(err,decoded)=>{
                    if(err)socket.emit('autorizado',false)
                    else socket.emit('autorizado',true)
		    console.log('check '+socket.id)
                    })
                });
                socket.on('projetos', () => {
                    socket.join('projetosRoom');
                });
                socket.on('getProjetos', () => {
                    socket.join('projetosRoom');
                    //console.log(token);
                    socket.emit('projetos', [{titulo: 'sdadsa13131d', lider:{fullname: 'Andre 1',role: 'admin'}},{titulo: 'sdadsa3131ddsadse131', lider:{fullname: 'Andre 2',role: 'admin'}}]);
                });
                //console.log(decoded)
                console.log(`Socket ${socket.id} has connected`);
		
          //  }
          //});

    });
require('./porta')(io);
mongoose.connect(config.databaseURI, { useCreateIndex: true, useNewUrlParser: true })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err));
app.use(cors());
app.use(bodyParser.json());

// app.get('/', (req, res, next) => {
//     //res.send('ads')
//     res.sendFile(__dirname + '/index.html');
// });
app.use(morgan('common'));
app.use('/usuarios', usuarios);
app.use('/projetos', projetos);
app.use('/registro', registro);

app.use(function(req, res, next) {
    var accept = req.accepts('html', 'json', 'xml');
    if (accept !== 'html') {
        return next();
    }

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


