//server.js

//BASE CONFIGURATION

//packages
var express = require('express');
var app = express(); //define app is using express
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Todo = require('./app/models/todo');//imports todo schema
var User = require('./app/models/user');//imports User Schema
mongoose.connect('mongodb://admin:lame53@ds033669.mongolab.com:33669/remind_me'); //connect to mongoDB database


//user body-parser
//let us get data from Post CRUD operation
app.use(bodyParser.urlencoded( {extended: true} ));
app.use(bodyParser.json());
app.use(cors());//CORS FUNCTIONALITY


//added for CORS functionality
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});



var port = process.env.PORT ||  5000; //set port to listen on

//Routes for API
//****************************************************//
var router = express.Router(); //instance of express router

// middleware to use for all requests
router.use(function(req, res, next) {
  //log whenever anything is happening
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

//test route. GET http://localhost:8080/api
router.get('/', function(req,res){
  res.json({message: 'welcome to our API dawg!'})
});

//routes for all users
router.route('/users')

  //create a user. This will only be done when a new user
  //first creates account for app
  .post(function(req,res){
    //setup new user and add pertinent information
    var user = new User();//new isntance of user model (users.js)
    user.username = req.body.username;
    user.passwd = req.body.passwd;
    user.save(function(err){
      if(err){
        res.send(err);
      }
      res.json({message: 'User ' + req.body.username + ' Added!'});
    });
  })//end new user post operation

  //get operation for all users
  .get(function(req,res){
    //in query use req.params when hooked to frontend
    User.find({},function(err,user){
      if(err){
        res.send(err);
      }
      res.json(user);
    });

  });//end get operation

//single user routes

router.route('/:username')
  //get operation
  .get(function(req,res){
    //in query use req.params when hooked to frontend
    User.find({username: req.params.username},function(err,user){
      if(err){
        res.send(err);
      }
      res.json(user[0]);//maybe take [0] out
      console.log('Sending data: ' + user[0]);
    });

  })//end get operation

  //user adds new todo, changes username or password
  .put(function(req,res){
      //create new todo
      var todo = new Todo({
        task: req.body.task,
        date: req.body.date,
        loc:{
          long:req.body.long,
          lat:req.body.lat
        },
        completed: req.body.completed,
        push_notif: req.body.push_notif
      });
      //query by username and push new todo
      User.findOneAndUpdate(
        {username: req.params.username},
        {$push: {todos: todo.toObject()}},
        {safe: true, upset: true},
        //call back
        function(err, user){
          if(err)
            console.log(err);
          else{
            console.log('Added new todo \"' + todo.task + '\" to profile '
            + user.username);
            //send updated data back to client
            res.send(user);
          }
        }
      );
  });
//routes for specific todos
router.route('/:username/:_id')
  //updating specific todo
  .put(function(req,res){
      //create todo to obey schema (hacky)
      var todo = new Todo({
        task: req.body.task,
        date: req.body.date,
        loc:{
          long:req.body.long,
          lat:req.body.lat
        },
        completed: req.body.completed,
        push_notif: req.body.push_notif
      });
      //cast id to mongoDB ObjectId
      var id = new mongoose.Types.ObjectId(req.body._id);
      //query statement
      User.findOneAndUpdate(
        //query by username and match element by casted id
        { username: req.params.username,
          //maybe do todos.id later (cleaner looking)
          'todos': {'$elemMatch': {_id: id}}
        },
        { $set:
          {
            'todos.$.task': todo.task,
            'todos.$.date': todo.date,
            'todos.$.loc.long': todo.loc.long,
            'todos.$.loc.lat': todo.loc.lat,
            'todos.$.completed': todo.completed,
            'todos.$.push_notif': todo.push_notif
          }
        },
        {upsert: true},
        //callback
        function(err, todo){
          if(err)
            res.send(err);
          else
            res.send({message:'todo updated!'});
        });
  })

  //delete todo
  .delete(function(req,res){
    //cast id to mongoDB ObjectId
    console.log("About to delete todo" + req.params._id);
    var id = new mongoose.Types.ObjectId(req.params._id);
    User.findOneAndUpdate(
      { username: req.params.username},
      {
        $pull: {'todos':  {_id: id}}
      },
      function(err, todo){
        //console.log(req.params.todo_id + ' ' + req.params.username)
        if(err)
          res.send(err);
        else
          res.json({message: 'Todo ' + todo.task + ' removed'});
      });
  });
//more routes for API here
//all routes preficed with /api
app.use('/api', router);

//START SERVER
//****************************************************//
app.listen(port);
console.log('yo check out port ' + port + ' dawg');
