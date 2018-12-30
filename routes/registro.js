const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth_middleware, permitir } = require('../middleware');
require('../model/Registro');
var Registro = mongoose.model('Registro');

router.post('/entrada', auth_middleware, permitir('admin'), (req, res) => {
    if(!req.body.id || req.body.id == null || typeof req.body.id == undefined){
        res.json({success: false, msg: 'Api ok, Id necessário'});
    }
    //caso ja exista entrada sem saída, invalida a anterior antes de registrar uma nova
    else Registro.findOneAndUpdate({idUser: req.body.id, horaSaida: null, invalido: null, tipo: 'porta'},
                                   {$set : {invalido: true}},
                                   {new: true}, 
            (err, r) => {
                if (err) res.json({success: false, msg: 'Erro ao registrar entrada, '+err,err: err});
                else {
                    const newRegistro = {
                        idUser: req.body.id,
                        tipo: 'porta',
                        horaEntrada: new Date()
                    }
                    var registro = new Registro(newRegistro);
                    registro.save().then((registroCriado) => {
                        res.json({success: true, msg: 'Entrada registrada'+(r?' (entrada anterior invalidada), ':', ')+registroCriado, registro: registroCriado});
                    }).catch(err => {
                        res.json({success: false, msg: 'Erro ao registrar entrada, '+err,err: err});
                    });
                } 
            });
});

router.post('/saida', auth_middleware, permitir('admin'), (req, res) => {
    if(!req.body.id || req.body.id == null || typeof req.body.id == undefined){
        res.json({success: false, msg: 'Api ok, Id necessário'});
    }
    //procura entrada para adicionar saida, se não houver apenas registra uma saída invalidada
    else Registro.findOneAndUpdate({idUser: req.body.id, horaSaida: null, invalido: null, tipo: 'porta'},{$set : {horaSaida: new Date()}},{new: true}, function (err, registro) {
        if (err) res.json({success: false, msg: 'Erro ao registrar saída, '+err,err: err});

        else if (registro) res.json({success: true, msg: 'Saída registrada, '+registro});

        else {
            const newRegistro = {
                idUser: req.body.id,
                tipo: 'porta',
                horaSaida: new Date(),
                invalido: true
            }
            var registro = new Registro(newRegistro);
            registro.save().then((registroCriado) => {
                res.json({success: true, msg: 'Saída registrada (inválida pois entrada não encontrada)'+registroCriado, registro: registroCriado});
            }).catch(err => {
                res.json({success: false, msg: 'Erro ao registrar saída, '+err,err: err});
            });
            
        } 
    });

});
module.exports = router;
