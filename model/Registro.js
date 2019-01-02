const mongoose = require('mongoose');
const Schema = mongoose.Schema

const RegistroSchema = new Schema({
    idUser: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    tipo: {type: String },
    horaEntrada: { type: Date },
    horaSaida: { type: Date, },
    invalido: {type: Boolean},
  });

  var Registro = mongoose.model('Registro', RegistroSchema, 'registros');

  module.exports = { Registro }