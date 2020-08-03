require('dotenv').config();
const express = require("express");
const app = express(),
path = require('path'),
fs = require('fs');;
const http = require('http').Server(app);
const https = require('https').Server({
	key: fs.readFileSync('/etc/letsencrypt/live/larm.gq/privkey.pem', 'utf8'),
	cert: fs.readFileSync('/etc/letsencrypt/live/larm.gq/cert.pem', 'utf8'),
	ca: fs.readFileSync('/etc/letsencrypt/live/larm.gq/chain.pem', 'utf8'), 
},app)
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

// setTimeout(()=>process.exit(0),60*60*1000*4);

const jwt = require('jsonwebtoken');
var ioServer = require('socket.io');

var io = new ioServer();
io.attach(http);
io.attach(https);
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
                    if(err){
                        socket.emit('autorizado',false);
		                console.log('nao autorizado ',socket.id, jwt.decode(token,{json:true}).fullName);
                    }
                    else{ 
                        socket.emit('autorizado',true);
		                console.log('autorizado ',socket.id, decoded.fullName);}
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
                
                socket.on('disconnect', () => {
                    var clientIp =socket.request.connection.remoteAddress;
                    console.log(`${socket.id} desconectou-se ipv6/v4 ${clientIp}`);
                });
                
                var clientIp =socket.request.connection.remoteAddress;
                console.log(`Socket ${socket.id} conectou-se ipv6/v4 ${clientIp}`);
		
          //  }
          //});

    }); 
require('./porta')(io);
mongoose.connect(config.databaseURI, { useCreateIndex: true, useNewUrlParser: true })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err));
app.all('*', function(req,res,next) {
  //console.log('http&&',req.headers['x-forwarded-proto'])
  //if(req.headers['x-forwarded-proto'] != 'https')
  //  res.redirect('https://'+req.hostname+req.url)
  //else
    next() /* Continue to other routes if we're not redirecting */
});
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
// app.get('/', (req, res, next) => {
//     //res.send('ads')
//     res.sendFile(__dirname + '/index.html');
// });
app.use(morgan('combined',{ 
skip: (req, res)=> {
    var url = req.url;
    if(url.indexOf('?')>0)
      url = url.substr(0,url.indexOf('?'));
    if(url.match(/(js|jpg|png|ico|css|woff|woff2|eot|ttf)$/ig)) {
      return true;
    }
    return false;
  }}));
  
app.use(function (req, res, next) {

    const corsWhitelist = [
        'https://larm.netlify.com',
        'https://localhost',
    ];
    if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }
    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'https://larm.netlify.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With,content-type,Content-Type,Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    } else {
        return next();
    }
});
let a=false;
var digestRequest = require('request-digest')('larm', 'larm@ufscaru');
app.get('/httpsCameraImage/:id.jpg',(req,res)=>{
            digestRequest.request({
                host: 'http://150.162.234.21',
                path: '/Camera%20'+req.params.id+'/poll.php',
                port: 8888,
                method: 'GET',
                encoding: null,
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                } else{
                    
                    res.set('Content-Type', 'image/jpeg');
                    if(!a){
                        console.log(response.request.headers)
                        a=!a;
                    }
                    res.send(response.body)
                }
            });
})
app.get('/httpsCamera/:id',(req,res)=>{
    let html=`<html><head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Camera ${req.params.id}</title>
<script type="text/javascript">
//<![CDATA[
var x = 1;
var loadingterminated = true;
var tmpimage = new Image();
var rate = 1;
var fastpollrate = 200;
function doFlip(){
    var campicture0 = document.getElementById('campicture0');
    var campicture1 = document.getElementById('campicture1');
    if (campicture0.style.zIndex == 3){
        campicture1.style.zIndex = 2;
        campicture0.style.zIndex = 1;
        campicture1.style.zIndex = 3;
    } else {
        campicture0.style.zIndex = 2;
        campicture1.style.zIndex = 1;
        campicture0.style.zIndex = 3;
    }
    loadingterminated = true;
}
function snapshotLoaded(){
    var campicture0 = document.getElementById('campicture0');
    var campicture1 = document.getElementById('campicture1');
    if (rate < 1)
        doFlip();
    if (campicture1.style.zIndex == 3)
        campicture0.src = tmpimage.src;
    else
        campicture1.src = tmpimage.src;
    if (rate >= 1)
        setTimeout("doFlip()", 500);
}
function snapshotNotLoaded(){
    loadingterminated = true;
}
tmpimage.onload = snapshotLoaded;
tmpimage.onerror = snapshotNotLoaded;
tmpimage.onabort = snapshotNotLoaded;
function reload(){
    if (loadingterminated){
        loadingterminated = false;
        var now = new Date();
        var camImg = '/httpsCameraImage/${req.params.id}.jpg?dummy=' + now.getTime().toString(10);
        tmpimage.src = camImg;
        x = 1;
    }
}
function startClock(){
    if (rate < 1){
        reload();
        setTimeout("startClock()", fastpollrate);
    } else {
        x = x - 1;
        if (x < 1)
            reload();
        setTimeout("startClock()", 1000);
    }
}
//]]>
</script>
<style type="text/css">
/*<![CDATA[*/
* {
	margin: 0;
	padding: 0;
}
html, body {
	overflow: hidden;
	height: 100%;
}
a#pollimglink {
	cursor: pointer;
	position: relative;
	display: block;
	z-index: 4;
	width: 100%;
	height: 100%;
	outline: none;
}
img.campicture, a:link img.campicture, a:visited img.campicture, a:hover img.campicture, a:active img.campicture, a:focus img.campicture {
	border: 0;
	margin: 0;
	padding: 0;
	position: absolute;
	display: block;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
}
/*]]>*/
</style>
</head>

<body>
<a id="pollimglink" class="transparentbkg"></a>
<img class="campicture" style="width: 100%; height: 100%; z-index: 1;" id="campicture0" src="/httpsCameraImage/${req.params.id}.jpg" alt="Snapshot Image"><img class="campicture" style="width: 100%; height: 100%; z-index: 3;" id="campicture1" src="/httpsCameraImage/${req.params.id}.jpg" alt="Snapshot Image"><script type="text/javascript">
//<![CDATA[
startClock();
//]]>
</script>

</body></html>`
    res.send(html);

})
app.use('/infodump',express.Router().get('/',(req,res)=>{
const inspector = require('event-loop-inspector')();
const dump = inspector.dump();
 
res.send(dump);
}));
app.use('/usuarios', usuarios);
app.use('/projetos', projetos);
app.use('/registro', registro);
app.use('/fotosPerfil', express.static(__dirname+'/fotosPerfil'));

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

//const httpsServer = https.createServer(credentials, app);

http.listen(8080, () => {
    console.log("Funcionando! porta:"+8080)
})


https.listen(config.port, () => {
	console.log('HTTPS Server running on port '+config.port);
});
