//app/models/todo.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoSchema = new Schema({
  task: String,
  date: {type: Date, default: Date.now},
  loc: {
    long: Number,
    lat: Number
  },
  completed: Boolean,
  push_notif: Boolean
});

module.exports = mongoose.model('Todo', TodoSchema);
