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
    else 
        //caso ja exista entrada sem saída, invalida a anterior antes de registrar uma nova
    Registro.findOneAndUpdate({idUser: req.params.id, horaSaida: null, $or:[{invalido: null},{invalido: false}], tipo: 'web'},
                              {$set : {invalido: true}},
                              {new: true}, 
                              (err, r) => {
        if (err) res.json({success: false, msg: 'Erro ao registrar entrada, '+err,err: err});
        else {
            const newRegistro = {
                idUser: req.params.id,
                tipo: 'web',
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
    else     
    Registro.findOneAndUpdate(
        {idUser: req.params.id, horaSaida: null, $or:[{invalido: null},{invalido: false}], tipo: 'web'},
        {$set : {horaSaida: new Date()}},
        {new: true},
        (err, registro) => {
            if (err) 
                res.json({success: false, msg: 'Erro ao registrar saída, '+err,err: err});
            else if (registro) 
                res.json({success: true, msg: 'Saída registrada, '+registro});
            else {
                const newRegistro = {
                    idUser: req.params.id,
                    tipo: 'web',
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
router.get('/relatorio/porta/:id', auth_middleware, permitir('admin'), (req, res) => {
    if(!req.params.id || req.params.id == null || typeof req.params.id == undefined){
        res.json({success: false, msg: 'Api ok, Id necessário'});
    }
    else Registro.find({idUser: req.params.id, $or:[{invalido: null},{invalido: false}], tipo: 'porta'},{horaEntrada: 1, horaSaida: 1},
            (err, registros) => {
                if (err) 
                    res.json({success: false, msg: 'Erro get registros porta, '+err,err: err});
                else 
                    res.json({success: true, msg: 'Sucesso get registros porta', id: req.params.id, registros});                  
            });
});

module.exports = router;
