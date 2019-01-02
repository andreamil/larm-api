const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { auth_middleware,permitir } = require('../middleware');
    require('../model/Projeto')
    const Projeto = mongoose.model('Projeto')



    router.get('/', auth_middleware, /*permitir('admin', 'professor'),*/ (req, res) =>  {
        Projeto.find(req.role=='aluno'?{$or:[{lider: req.id},{integrantes: {_id:req.id} }]}:{})
            .populate('integrantes', { password: 0, tokens: 0,createdDate:0})
            .populate('lider', { password: 0, tokens: 0, createdDate:0})
            .then((projetos)=>{
                res.json({success: true, msg: 'Successfully getted projetos', projetos});   
            }).catch(err => {
                res.json({success: false, msg: 'Erro get projetos',err: err})
            });
    })



    router.get('/user/:id', auth_middleware, (req, res) =>  {
        const id = req.params.id;
        Projeto.find({$or:[{lider: id},{integrantes: {_id:id} }]})
            .populate('integrantes', { password: 0, tokens: 0,createdDate:0})
            .populate('lider', { password: 0, tokens: 0,createdDate:0})
            .then((projetos)=>{
                res.json({success: true, msg: 'Successfully getted projetos', projetos});
            }).catch(err => {
                res.json({success: false, msg: 'Erro get projetos',err: err})
            });
    })



    router.post('/', auth_middleware, (req, res) => {
        console.log(req.headers['authorization'])
        if(!req.body.titulo || req.body.titulo == null || typeof req.body.titulo == undefined){
            res.json({success: false, msg: 'Titulo necessário'})
        }

        if(!req.body.descricao || req.body.descricao == null || typeof req.body.descricao == undefined){
            res.json({success: false, msg: 'Descrição necessária'})
        }
        let token = req.headers['authorization']; // Express headers are auto converted to lowercase
        token = token.slice(7, token.length);
        const newProjeto = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            categoria: req.body.categoria,
            lider: jwt.decode(token)._id,
            vigencia: req.body.vigencia
        }
        var projeto = new Projeto(newProjeto);
        projeto.save().then(() => {
            res.json({success: true, msg: 'Projeto criado', projeto: newProjeto});
        }).catch(err => {
            res.json({success: false, msg: config.msgs.userSaveFailed,err: err})
        })

    });



module.exports = router;
