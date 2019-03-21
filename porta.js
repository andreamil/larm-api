const mongoose = require('mongoose');
const Registro = mongoose.model('Registro');
const Usuario = mongoose.model('Usuario');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

console.log('Conectando ao Arduino...');
const sp = new SerialPort("/dev/ttyUSB0", {
    baudRate: 9600
})
const parser = sp.pipe(new Readline({
    delimiter: '\r\n'
}))

var newUserTo = null;
var ioInstance;
sp.on('open', function() {
    console.log('porta serial aberta');
});
sp.on('close', function() {
    console.log('->CLOSED<-');
    console.log(sp.isOpen);

    var i =  setInterval(() => {
        
        if (sp.isOpen){
            clearInterval(i)
        }   
        else{         
            sp.open((err)=>{
                console.log("arduino desconectado");                
            })     
        }        
    }, 1000);
});


parser.on('data', function(rfid) {
    console.log('RFID lido:', rfid);
    module.exports.registrarRFID(rfid,true);
    });
parser.on('error', function(err) {
    console.log('Error: ', err);
})
module.exports = function(io) {
    ioInstance = io;
    ioInstance.on('connection', socket => {
        socket.on('registrarRFID', (rfid) => {
            module.exports.registrarRFID(rfid,false);
        });
        socket.on('get foto larm', () => {
            var digestRequest = require('request-digest')('larm', 'camera123');
            digestRequest.request({
              host: 'http://150.162.234.21',
              path: '/HP%20Webcam%20HD-4110/poll.php',
              port: 8888,
              method: 'GET',
              encoding: null,
            }, function (error, response, body) {
              if (error) {
                console.log( error);
              }else            
              socket.emit('foto larm',new Buffer(response.body).toString('base64'))
            });
        });
        socket.on('ler novo usuario', () => {
            if (newUserTo) {
                var config = {
                    status: 'warning',
                    destroyByClick: true,
                    duration: 5000,
                    hasIcon: true,
                    position: 'top-right',
                }
                socket.emit('notificacao', {
                    body: 'Algum usuario esta cadastrando no momento, aguarde',
                    title: 'Entrada',
                    config
                })
            } else {
                newUserTo = socket.id;
                console.log('lendo novo usuario', socket.id);
                socket.emit('lendo novo usuario', true);
                setTimeout(() => {
                    newUserTo = null;
                    socket.emit('lendo novo usuario', false);
                }, 20000);
            }

        });
    });
}
module.exports.registrarRFID=(rfid,serialwrite)=>{
    if(rfid==null){
        var config = {
            status: 'danger',
            destroyByClick: true,
            duration: 20000,
            hasIcon: true,
            position: 'top-right',
        }
        ioInstance.emit('notificacao', {
            body: 'RFID invalido ou nulo',
            title: 'Invalido',
            config
        })
    }
    else{
        Usuario.findOne({
                rfid: rfid
            }, (err, u) => {
                if (err) {
                    if(serialwrite)sp.write('NOK!')
                    console.log('Erro find 1 ')
                } else {
                    Registro.findOneAndUpdate({
                            rfid: rfid,
                            horaSaida: null,
                            $or: [{
                                invalido: null
                            }, {
                                invalido: false
                            }],
                            tipo: 'porta'
                        }, {
                            $set: {
                                horaSaida: new Date()
                            }
                        }, {
                            new: true
                        },
                        (err, r) => {
                            var write = (u ? (u.permissao != 'n' ? u.fullName : 'NOK') : 'NOK') + '!';
                            var nome = u ? u.fullName : 'Usuario nao cadastrado';
                            if (err) {
                                if(serialwrite)sp.write('NOK!');
                                console.log('Erro registro 1')
                            } else if (r) {
                            if(serialwrite)
                                if(write!='NOK!')sp.write('(saida)'+write);
                                else sp.write('NOK!');
                                var config = {
                                    status: 'warning',
                                    destroyByClick: true,
                                    duration: 20000,
                                    hasIcon: true,
                                    position: 'top-right',
                                }
                                ioInstance.emit('notificacao', {
                                    body: nome+'\n'+rfid,
                                    title: 'Saida',
                                    config
                                })
                                console.log('Saída registrada, '+write+' ' + rfid + ', ' + nome, r.horaEntrada?r.horaEntrada:'',r.horaSaida?r.horaSaida:'')
                            } else {
                                var barrado = (u && u.permissao != 'n') ? '' : '(BARRADO) ';
                                var registro = new Registro({
                                    rfid: rfid,
                                    tipo: 'porta',
                                    horaEntrada: new Date()
                                });
                                if(u)registro.idUser=u._id;
                                if((u && u.permissao == 'n')||!u)registro.invalido = true;

				                if (newUserTo!=null) {
				                    ioInstance.to(newUserTo).emit('novo RFID', rfid);
				                    newUserTo = null;
					                //sp.write('RFID registrado!');
				                }
                                if(serialwrite)sp.write(write);
                                registro.save().then((registroCriado) => {
                                    var config = {
                                        status: (u && u.permissao != 'n') ? 'success' : 'danger',
                                        destroyByClick: true,
                                        duration: 20000,
                                        hasIcon: true,
                                        position: 'top-right',
                                    }

                                    ioInstance.emit('notificacao', {
                                        body: barrado + nome+'\n'+rfid,
                                        title: 'Entrada',
                                        config
                                    })
                                    console.log('Entrada registrada, ' + barrado + rfid + ', ' + nome, registroCriado.horaEntrada?registroCriado.horaEntrada:'',registroCriado.horaSaida?registroCriado.horaSaida:'')
                                }).catch(err => {
                                    //sp.write('NOK!');
                                    console.log('Erro registro 2', err)
                                });
                            }
                        });
                }

            });
            }
}

