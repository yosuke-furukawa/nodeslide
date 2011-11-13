
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , io = require('socket.io')
  , mongoose = require('mongoose')

var app = module.exports = express.createServer();
var counter = 0;
var mongoUri = 'mongodb://127.0.0.1/test_ninja';
var Schema = mongoose.Schema;
var commentSchema = new Schema({
    slideno :Number,
    message :String,
    slideKey:String,
    x       :Number,
    y       :Number
});


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());      　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  mongoose.connect(mongoUri);
});
var Comment = mongoose.model('Comment', commentSchema);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Process
io = io.listen(app);
io.sockets.on('connection', function (socket) {
  counter++;
  io.sockets.emit('counter', {count: counter});

  socket.on('disconnect', function () {
    counter--;
    io.sockets.emit('counter', {count: counter});
  });
  Comment.find(function(err,docs){ 
        if(!err) {
            for (var i = 0; i < docs.length; i++ ) {
                console.log(docs[i]);
		if (docs[i].message) {
			socket.emit('loaded', docs[i]);
                } else {
			Comment.findById(docs[i].id, function (err, comment) {
			if (!err) {
            			comment.remove();
        		} else {
          			console.log(err);
        		}
      			});
		}
            }
        } else {
	    console.log(err);
	}

  });
  socket.on('create', function (data) {

    console.log(data);
    if (data) {
      console.log("Data : %s", data.message);
      console.log("Data : %s", data.slideno);

      var comment = new Comment();
      comment.slideno = data.slideno;
      comment.x = data.x;
      comment.y = data.y;
      comment.slideKey = 'default';
      console.log(comment);
      comment.save(function(err, doc) {
	console.log('saved: %s', doc.id);
        if (!err) { 
          socket.emit('created', {id: doc.id, slideno: doc.slideno, x: doc.x, y:doc.y});
          socket.broadcast.emit('created by other', {id: doc.id, slideno: doc.slideno, x: doc.x, y:doc.y});
        } else {
          console.log(err);
        }
      });
    }
  });

  socket.on('text edit', function (data) {
    if (data && data.message) {
      Comment.findById(data.id, function (err, comment) {
        if (!err) {
          if (data.message != null) {
            comment.message = data.message;
          }
          comment.save(function(err){
            if (!err) {
              socket.emit('text edited', {id: comment.id, slideno: comment.slideno, x: comment.x, y: comment.y, message: comment.message});
              socket.broadcast.emit('text edited', {id: comment.id, slideno: comment.slideno, x: comment.x, y: comment.y, message: comment.message});
            } else {
              console.log(err);
            }
          });
        }
      });
    }
  });

  socket.on('delete', function (data) {
    console.log(data);
    if (data) {
      Comment.findById(data.id, function (err, comment) {
	if (!err && comment) {
            comment.remove();
            socket.emit('deleted', {id: data.id});
            socket.broadcast.emit('deleted', {id: data.id});
        } else {
          console.log(err);
        }
      });
    }
  });

  socket.on('update', function(data) {
     if (data) {
       Comment.findById(data.id, function(err, comment) {
         comment.x = data.x;
         comment.y = data.y;
         comment.save(function(err){
           if (!err) {
             socket.emit('updated', {id: comment.id, x: comment.x, y: comment.y});
             socket.broadcast.emit('updated', {id: comment.id, x: comment.x, y: comment.y});
           } else {
             console.log(err);
           }
         });
       });
     }
  });

  //socket.emit('loaded', { id: 0, x: 500, y: 500, slideno: 0, message: 'message' });
  //socket.emit('loaded', { id: 1, x: 250, y: 500, slideno: 2, message: 'message22' });
  //socket.on('delete', function (data) {
  //  console.log(data);
  //});
  //  socket.on('update', function (data) {
  //  console.log(data);
  //  socket.emit('updated', { id: 3 });
  //});
});
