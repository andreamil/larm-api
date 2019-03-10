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
let newUserTo;
var ioInstance;
sp.on('open', function() {
    console.log('porta serial aberta');
});


parser.on('data', function(rfid) {
    console.log('RFID lido:', rfid);
    module.exports.registrarRFID(rfid);
    });
    sp.on('error', function(err) {
        console.log('Error: ', err.message);
    })
module.exports = function(io) {
    ioInstance = io;
    ioInstance.on('connection', socket => {
        socket.on('registrarRFID', (rfid) => {
            module.exports.registrarRFID(rfid);
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
                }, 30000);
            }

        });
    });
}
module.exports.registrarRFID=(rfid)=>{
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
                    sp.write('NOK!')
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
                                sp.write('NOK!');
                                console.log('Erro registro 1')
                            } else if (r) {
                                sp.write('(entra)'+write);
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
                                console.log('Saída registrada, '+write+' ' + rfid + ', ' + nome, r)
                            } else {
                                var barrado = (u && u.permissao != 'n') ? '' : '(BARRADO) ';
                                var registro = new Registro({
                                    rfid: rfid,
                                    tipo: 'porta',
                                    horaEntrada: new Date()
                                });
                                if((u && u.permissao == 'n')||!u)registro.invalido = true;

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
				                    if (newUserTo) {
				                    	ioInstance.to(newUserTo).emit('novo RFID', rfid);
				                    	newUserTo = null;
					                    sp.write('RFID registrado!');
				                    }
                                    else sp.write('(saida)'+write);
                                    console.log('Entrada registrada, ' + barrado + rfid + ', ' + nome, registroCriado)
                                }).catch(err => {
                                    sp.write('NOK!');
                                    console.log('Erro registro 2', err)
                                });
                            }
                        });
                }

            });
            }
}

