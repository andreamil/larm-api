const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    fullName: {
      type: String,
      required: true,
      minlength: 1,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email'
      }
  },
    password: {
      type: String,
      required: true,
      minlength: 4
    },
    role: {
      type: String,
    },
    tokens: [{
      access: {
        type: String,
        //required: true
      },
      token: {
        type: String,
      //  required: true
      },
      isValid: {
        type: Boolean,
        default: true
      },
      tokenDate: {
        type: Date,
        default: new Date()
      }
    }],
    access_token: {
      type: String
    },
    createdDate: {
      type: Date,
      default: new Date()
    }
  });

  // UserSchema.methods.toJSON = function () {
  //   var user = this;
  //   var userObject = user.toObject();

  //   return _.pick(userObject, ['_id', 'email', 'name', 'date']);
  // };

  UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    //console.log(createdDate);
    var token = jwt.sign({ _id: user._id.toHexString(), access, role: user.role,fullName:user.fullName }, config.secret ).toString();

    user.tokens.push({ access, token});

    return user.save().then(() => {
      return token;
    });
  };

  UserSchema.statics.authenticate = function (email, password) {

    var User = this;

    return User.findOne({ email }).then((user) => {
      if (!user) {
        return Promise.reject('Email or (password) is invalid.');
      }

      return new Promise((resolve, reject) => {
        // Use bcrypt.compare to compare password and user.password
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject('(Email) or password is invalid.');
          }
        });
      });
    });
  }

  UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
      decoded = jwt.verify(token, config.secret);
      return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth',
        'tokens.isValid': true
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var User = mongoose.model('User', UserSchema);

  module.exports = { User }
