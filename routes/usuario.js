const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require("../config");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { ObjectID } = require('mongodb');
const { auth_middleware} = require('../middleware');

// Loading User Model
// Carregando Model de usuário
    require('../model/Usuario');
    const Usuario = mongoose.model('Usuario');

// Router
    /*
        Register Route:
        The goal of this route, is create new users.
        It receives three parameters: Name, Password and Email, if one of those is null, the API Will return a json with error message

        Rota register:
        O Objetivo desta routa é criar novos usuários
        Ela recebe três parâmetros: Nome, senha e email, se um deles for nulo a API Vai retornar um json com um mensagem de erro
    */
    router.post('/register', (req, res) => {
        // Server-side Verification
            // Validating E-mail
            // Validando E-mail
                if(!req.body.email || req.body.email == null || typeof req.body.email == undefined){
                    res.json({success: false, msg: config.msgs.invalidEmail});
                }
            // Validating name
            // Validando nome
                if(!req.body.fullName || req.body.fullName == null || typeof req.body.fullName == undefined){
                    res.json({success: false, msg: config.msgs.invalidName});
                }
            // Validating password
            // Validando senha
                if(!req.body.password || req.body.password == null || typeof req.body.password == undefined){
                    res.json({success: false, msg: config.msgs.invalidPassword});
                }
                // Validating password's size
                // Validando o tamanho da senha
                    if(req.body.password.length < config.passwordMinLength){
                        res.json({success: false, msg: config.msgs.weakPassword});
                    }
            // Creating user:
            // Criando usuário:
                    const newUser = {
                        fullName: req.body.fullName,
                        email: req.body.email,
                        password: req.body.password,
                        role: req.body.role
                    }
                    // Checking if user already exists in database
                    // Checando se o usuário já existe no banco de dados
                    Usuario.findOne({email: newUser.email}).then((user) => {
                            if(user){
                                return res.json({success: false, msg: config.msgs.userAleadyExists});
                            }else{
                                // Hashing password
                                // 'Hasheando' a senha
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                                        if(err){
                                            res.sendStatus(403);
                                        }
                                        newUser.password = hash;
                                        var user = new Usuario(newUser);
                                        user.save().then(() => {
                                          return jwt.sign({ _id: user._id.toHexString(), role: user.role,fullName:user.fullName }, config.secret);
                                        }).then((token) => {
                                            res.json({success: true, msg: config.msgs.userCreated, user: newUser, data: { token }});
                                        }).catch(err => {
                                            res.json({success: false, msg: config.msgs.userSaveFailed,err: err});
                                        })
                                    })
                                })
                            }
                        }).catch(err => {
                            res.sendStatus(403)
                        })
    });

  //router.post('/authenticate', (req, res) => {
    router.post('/login',(req, res) => {
        // Server-side Verification
            // Validating E-mail
            // Validando E-mail
            if(!req.body.email || req.body.email == null || typeof req.body.email == undefined){
                res.json({success: false, msg: config.msgs.invalidEmail});
            }

        // Validating password
        // Validando senha
            if(!req.body.password || req.body.password == null || typeof req.body.password == undefined){
                res.json({success: false, msg: config.msgs.invalidPassword});
            }
            Usuario.authenticate(req.body.email, req.body.password).then((user) => {
                var token = jwt.sign({ _id: user._id.toHexString(), role: user.role,fullName:user.fullName }, config.secret);//.then((token) => {
                  res.json({ success: true, message: 'Successfully authenticated', id: user._id,
                  fullName: user.fullName,
                  email: user.email,
                  role: user.role, data: { token } });
                /*}).catch(err => {
                   res.status(401).json({ message: 'Erro generateAuthToken' });
                })*/

              }).catch(err => {
                 res.status(401).json({ message: 'Erro authenticate'+err });
              })
    });
    router.get('/', (req, res) => {
        console.log(req.headers);
      });
    router.post('/', (req, res) => {
      console.log(req.body.token);
      Usuario.findByToken(req.body.token).then((user) => {
        if(user){
          console.log('authorized',user,req.headers);
        res.json({
          msg: 'authorized'
        });
      }else{
        console.log('unauthorized',req.headers);
         res.status(401);
      }
      }).catch(err => {
        console.log('unauthorized',req.headers);
         res.status(401);
      });
    });
    /*router.post('/logout', (req, res) => {
      let token = req.headers['authorization']; // Express headers are auto converted to lowercase
      token = token.slice(7, token.length);

      Usuario.findByToken(token).then((user) => {
        user.tokens[user.tokens.findIndex(crr => crr.token === token)].isValid = false;
        user.save();
        res.json({ message: 'Successfully logged out', user });
      }).catch(err => {
         res.json({ error}) ;
      })
  });*/
        router.get('/user', auth_middleware, (req, res, next) =>  {
         Usuario.find().then((usuarios)=>{
            res.json({success: true, msg: 'Successfully getted the users', usuarios});
         }).catch(err => {
            res.json({success: false, msg: 'Erro get user',err: err})
         })
         });

         router.get('/user/:id', auth_middleware,  (req, res, next) =>  {
           const id = req.params.id;

           if (!ObjectID.isValid(id)) {
             res.status(404).json({ message: 'User not found' });
           }

           Usuario.findById(id).then((user)=>{
              res.json({success: true, msg: 'Successfully getted the user', user});
           }).catch(err => {
              res.json({success: false, msg: 'Erro get user por id',err: err});
           })
         })



module.exports = router;
