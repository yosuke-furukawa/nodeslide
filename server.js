
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
var slideKey = 'default';
var socketIds = new Array();
var slideMap = new Array();


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

app.get('/favicon.ico', function(req, res){
  res.render('favicon.ico', {});
});

app.get('/:id?', function(req, res){
  console.log(req.params.id);
  if (!req.params.id) {
    slideKey = 'default';
  } else {
    slideKey = req.params.id;
  }
  var counter = slideMap[slideKey];
  if (!counter) {
    slideMap[slideKey] = 0;
  }
  if(slideKey != 'default') {
    res.render(slideKey, { slideId: slideKey });
  } else {
    res.render('index', { slideId: 'default' });
  }
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Process
io = io.listen(app);
io.sockets.on('connection', function (socket) {

  socket.on('count up',function(data) {
    socket.set('slideId', data.slideId, function(){
      if (socketIds.indexOf(socket.id) < 0) {
        socketIds.push(socket.id);
        console.log(socket.id);
        var count = slideMap[data.slideId];
        count++;
        slideMap[data.slideId] = count;
        io.sockets.emit('counter', {count : count, slideId: data.slideId});
      }
    });
  });
  socket.on('disconnect', function () {
    console.log('disconnect');
    var index = socketIds.indexOf(socket.id);
    socketIds.splice(index, 1);
    socket.get('slideId', function (err, slideId){
      if (!err) {
      console.log("slideId disconnect" + slideId);
      var count = slideMap[slideId];
      count--;
      slideMap[slideId] = count;
      io.sockets.emit('counter', {count : count, slideId: slideId});
      } else {
        console.log(err);
      }
    });
  });
  Comment.find({slideKey: slideKey}, function(err,docs){ 
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
      comment.slideKey = slideKey;
      console.log(comment);
      comment.save(function(err, doc) {
	console.log('saved: %s', doc.id);
        if (!err) { 
          socket.emit('created', {id: doc.id, slideno: doc.slideno, x: doc.x, y:doc.y, slideKey:doc.slideKey});
          socket.broadcast.emit('created by other', {id: doc.id, slideno: doc.slideno, x: doc.x, y:doc.y, slideKey:doc.slideKey});
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
              socket.emit('text edited', {id: comment.id, slideno: comment.slideno, x: comment.x, y: comment.y, message: comment.message, slideKey:comment.slideKey});
              socket.broadcast.emit('text edited', {id: comment.id, slideno: comment.slideno, x: comment.x, y: comment.y, message: comment.message, slideKey:comment.slideKey});
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

  socket.on('cancel', function(data) {
    if (data) {
      Comment.findById(data.id, function (err, comment) {
	if (!err && comment) {
            comment.remove();
            socket.broadcast.emit('cancelled', {id: data.id});
        } else {
          console.log(err);
        }
      });

    }
  });

  socket.on('update', function(data) {
     if (data) {
       Comment.findById(data.id, function(err, comment) {
         if(!err && comment) {
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
         } else {
           console.log(err);
         }
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
