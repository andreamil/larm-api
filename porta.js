
        const mongoose = require('mongoose');
        const Registro = mongoose.model('Registro');
        const Usuario = mongoose.model('Usuario');
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline')
        const socket = require('./socket');
        console.log('Conectando ao Arduino...');
        const sp = new SerialPort("/dev/ttyUSB0", {
            baudRate: 9600
          })
        const parser = sp.pipe(new Readline({ delimiter: '\r\n' }))
        
        sp.on('open', function() {
        console.log('porta serial aberta');
        
        
        });
        parser.on('data', function(rfid) {
            console.log('RFID lido:', rfid);
            Usuario.findOne({rfid: rfid},(err, u) => {            
                if (err) {
                    sp.write('NOK!')
                    console.log('Erro find 1 ')
                }
                else {
                    Registro.findOneAndUpdate({rfid: rfid, horaSaida: null, $or:[{invalido: null},{invalido: false}], tipo: 'porta'},
                                              {$set : {horaSaida: new Date()}},
                                              {new: true}, 
                                              (err, r) => {
                        var write = (u?(u.permissao=='y'?u.fullName:'NOK'):'NOK')+'!';
                        var nome = u?u.fullName:'Usuario nao cadastrado';
                        if (err) {
                            sp.write('NOK!');
                            console.log('Erro registro 1')
                        }
                        else if (r) {
                            sp.write(write);
                            var config = {
                                status: 'warning',
                                destroyByClick: true,
                                duration: 5000,
                                hasIcon: true,
                                position: 'top-right',
                            }
                            socket.emitirTodos('notificacao',{body: nome,title: 'Saida',config})
                            console.log('Saída registrada, '+rfid+', '+nome,r)
                        }
                        else {
                            var barrado=u?u.permissao!='y'?'(BARRADO) ':'':'(BARRADO) ';
                            var registro = new Registro({
                                rfid: rfid,
                                tipo: 'porta',
                                horaEntrada: new Date()
                            });
                             u&&u.permissao!='y'&&(registro.invalido=true);
                             !u&&(registro.invalido=true)

                            registro.save().then((registroCriado) => {
                                var config = {
                                    status: u?u.permissao!='y'?'danger':'success':'danger',
                                    destroyByClick: true,
                                    duration: 5000,
                                    hasIcon: true,
                                    position: 'top-right',
                                }
                                socket.emitirTodos('notificacao',{body: barrado+nome,title: 'Entrada',config})
                                sp.write(write);
                                console.log('Entrada registrada, '+barrado+rfid+', '+nome,registroCriado)
                            }).catch(err => {
                                sp.write('NOK!');
                                console.log('Erro registro 2',err)
                            });
                        } 
                    });
                }
                
            });
        });
        sp.on('error', function(err) {
            console.log('Error: ', err.message);
        })
        
    