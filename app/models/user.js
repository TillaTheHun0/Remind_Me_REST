//app/models/users.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Todo = require('./todo');

//Schema for users collection in MongoDB instance
var UserSchema = new Schema({
  username: String,
  passwd: String,
  //array of todos. put todoschema here
  todos: [Todo.Schema]
});

module.exports = mongoose.model('User', UserSchema);
