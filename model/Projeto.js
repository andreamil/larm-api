const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config')
const Schema = mongoose.Schema


const ProjetoSchema = new Schema({
    titulo: { type: String, required: true, trim: true },
    status: { type: String, },
    categoria: { type: String, },
    lider: { type: Schema.Types.ObjectId, ref: 'User'  },
    integrantes: [{ type : Schema.Types.ObjectId, ref: 'User' }],
    vigencia: { type: String },
    descricao: { type: String, required: true },
    createdDate: { type: Date, default: new Date() }
  });

  var Projeto = mongoose.model('Projeto', ProjetoSchema);

  module.exports = { Projeto }
