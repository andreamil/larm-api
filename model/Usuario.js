const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config')
const Schema = mongoose.Schema

const UsuarioSchema = new Schema({
    fullName: { type: String, required: true, minlength: 4, trim: true },
    email: { type: String, required: true, trim: true, minlength: 4, unique: true,
      validate: { validator: validator.isEmail, message: '{VALUE} is not a valid email' } },
    password: { type: String, required: true, minlength: 4 },
    dataDeNascimento: { type: Date, },
    role: { type: String, },
    rfid: { type: String },
    foto: { type: String },
    siape: { type: String },
    matricula: { type: String },
    permissao: {type: String},
    tokens: [{
      access: { type: String },
      token: { type: String },
      isValid: { type: Boolean, default: true },
      tokenDate: { type: Date, default: new Date() } }],
    access_token: { type: String },
    createdDate: { type: Date, default: new Date() }
  });

  // UserSchema.methods.toJSON = function () {
  //   var user = this;
  //   var userObject = user.toObject();

  //   return _.pick(userObject, ['_id', 'email', 'name', 'date']);
  // };

  UsuarioSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ 	_id: user._id.toHexString(), 
				role: user.role,
				fullName:user.fullName,
				dataDeNascimento:user.dataDeNascimento,
				matricula:user.matricula,
				siape:user.siape  }, config.secret ).toString();

    user.tokens.push({ access, token});

    return user.save().then(() => {
      return token;
    });
  };

  UsuarioSchema.statics.authenticate = function (email, password) {

    var Usuario = this;

    return Usuario.findOne({ email }).then((user) => {
      if (!user) {
        return Promise.reject('*Email* ou senha incorreto');
      }

      return new Promise((resolve, reject) => {
        // Use bcrypt.compare to compare password and user.password
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject('Email ou *senha* incorreto');
          }
        });
      });
    });
  }

  UsuarioSchema.statics.findByToken = function (token) {
    var Usuario = this;
    try {
      var decoded = jwt.verify(token, config.secret);
      return Usuario.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth',
        'tokens.isValid': true
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var Usuario = mongoose.model('Usuario', UsuarioSchema, 'usuarios');

  module.exports = { Usuario }
