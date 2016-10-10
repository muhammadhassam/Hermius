var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var app = express();
var datetime = require('node-datetime');
var http = http = require('http').Server(app);
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var JWT_SECRET = 'hermeszeus';

var multer  = require('multer');
var filename;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public')
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now()+file.originalname);
  }
});

var upload = multer({ storage: storage });


var db = null;
//var messages;
MongoClient.connect("mongodb://localhost:27017/FYP", function(err, dbconn){
	if (!err) {
		console.log("We are connected");
        db = dbconn;   
	}
	else
	{
		console.log("NOT CONNECTED");
	}
});

app.use(bodyParser.json());

app.use(express.static('public'));

server.listen(80);
io.on('connection', function(socket){
	//console.log('IO CONNECTION SUCCESSFUL');
});

// function to save uplaos file
app.post('/profile',upload.any(), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
 // console.log(req.body);
  console.log(req.files);
  var filename= req.files;
    
// db.collection('View',function(err,collection){
// 	var newCommnt= {comment:req.files};
// collection.insert(newCommnt, {w:1}, function(err, result) {
     
//      //return res.send(req.files);
//   });
// });
return res.json(req.files);

});




app.get('/messages', function(req, res, next){
	db.collection('messages', function(err, messagesCollection){
		messagesCollection.find().toArray(function(err, messages){
			return res.json(messages);

		});
		return	db.collection;
	});
});


app.get('/chat/messages', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		chatMessagesCollection.find().toArray(function(err, chatMessages){
			return res.json(chatMessages);

		});
		return	db.collection;
	});
});

//Function to get chat messages by Room
app.get('/chat/messages/room', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		chatMessagesCollection.find({room: null}).toArray(function(err, chatMessages){
			//console.log(chatMessages.text);
			//console.log(chatMessages.text);
			return res.json(chatMessages);
		});
		return	db.collection;
	});
});

//Function to get chat messages by Room Name for Front Angular Page
app.put('/chat/messages/roomNameAng', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		//console.log("Hello 2");
		//console.log(req.body.meetingRoomName);
		chatMessagesCollection.find({room: req.body.meetingRoomName}).toArray(function(err, chatMessages){
			//console.log(chatMessages.text);
			//console.log(chatMessages.text);
			return res.json(chatMessages);
		});
		return	db.collection;
	});
});


//Function to get chat messages by Room Name && task Name for Front Angular Page
app.put('/chat/messages/taskNameAng', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		//console.log("Hello 2");
		//console.log(req.body.roomtaskName+" yellow");
		chatMessagesCollection.find({task: req.body.roomtaskName }).toArray(function(err, chatMessages){
			//console.log(chatMessages.text);
			//console.log(chatMessages);
			return res.json(chatMessages);
		});
		return	db.collection;
	});
});

//Function to get chat messages by Room Name && task Name for Front Angular Page
app.put('/chat/messages/taskNameAng', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		//console.log("Hello 2");
		//console.log(req.body.roomtaskName+" yellow");
		chatMessagesCollection.find({task: req.body.roomtaskName }).toArray(function(err, chatMessages){
			//console.log(chatMessages.text);
			//console.log(chatMessages);
			return res.json(chatMessages);
		});
		return	db.collection;
	});
});
//Function to get chat messages by Room
//{$or:[{"groupA":data},{"groupB":data}]}
app.put('/chat/messages/roomandtask', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		
		chatMessagesCollection.find({$and:[{room: req.body.meetingRoomName},{task:req.body.roomtaskName}]}).toArray(function(err, chatMessages){
			//console.log(chatMessages.text);
			//console.log(chatMessages.text);
			return res.json(chatMessages);
		});
		return	db.collection;
	});
});

// function to get users

app.get('/users/invite', function(req, res, next){

       db.collection('users', function(err, messagesCollection){
		messagesCollection.find().toArray(function(err, messages){
			return res.json(messages);

		});
		return	db.collection;
	});

	//return db.collection();
	//res.send();
});






// //Function to get chat messages by Tasks
// app.put('/chat/messages/taskNameArg', function(req, res, next){
// 	db.collection('chatMessages', function(err, chatMessagesCollection){
// 		console.log(req.body.meetingTaskName);
// 		chatMessagesCollection.find({task: req.body.meetingTaskName}).toArray(function(err, chatMessages){
// 			//console.log(chatMessages.text);
// 			//console.log(chatMessages.text);
// 			return res.json(chatMessages);
// 		});
// 		return	db.collection;
// 	});
// });

//Function to get rooms
app.get('/rooms', function(req, res, next){
	db.collection('rooms', function(err, messagesCollection){
		messagesCollection.find().toArray(function(err, messages){
			return res.json(messages);

		});
		return	db.collection;
	});
});
//usersCollection.findOne({username: req.body.username},
//Function to get tasks
app.put('/tasks', function(req, res, next){
	//console.log(req.body.meetingRoomName+ " print");
	db.collection('tasks', function(err, tasksCollection){
		tasksCollection.find({room: req.body.meetingRoomName}).toArray(function(err, tasks){
			return res.json(tasks);
		});
		return	db.collection;
	});
});

//Function to insert CHAT messages
app.post('/chat/messages', function(req, res, next){
	
	var now = new Date();
	var jsonDate = now.toJSON();

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);

	//console.log(req.body.newChatMessage);
	//console.log(req.body.newRoom);
	//console.log(req.body.taskName+"HELLOOOOOWDKJLKDJS");
	
	db.collection('chatMessages', function(err, chatMessagesCollection){
		var newChatMessage = {
			//room: req.body.newRoom,
			text: req.body.newChatMessage,
			user: user._id,
			username: user.username,
			date: jsonDate,
			room: req.body.roomName,
			task: req.body.taskName
			//roomId: room._id
		};
		chatMessagesCollection.insert(newChatMessage, {w:1}, function(err, newChatMessage){
			io.emit('{text: req.body.newChatMessage}');
			return res.send();
		});
	});
	//res.send();
});


//Function to select Room name
app.put('/newRoom', function(req, res, next){

	db.collection('rooms', function(err, roomsCollection){
		var newRoom = {
			//room: req.body.newRoom,

			name: req.body.newRoom,
			//user: user._id,
			//username: user.username
			RoomUsers : [
				req.body.newUser
			
				]
		};
		roomsCollection.findOne(newRoom,function(err, room){
			if(room){
				return res.status(400).send();
			}
			else{
				roomsCollection.insert(newRoom, {w:1}, function(err, messages){
					
					//var token = jwt.encode(user, JWT_SECRET);
					//return res.json({token: token});
					return res.send();
				});
			}
		});
	});
	//res.send();
});

//Function to Add a task
app.put('/newTask', function(req, res, next){

	//var token = req.headers.authorization;
	//var user = jwt.decode(token, JWT_SECRET);
	//console.log(req.body.newTask+" addedddd in "+req.body.newRoom+ " added");
	db.collection('tasks', function(err, tasksCollection){
		var newTask = {
			name: req.body.newTask,
			room: req.body.newRoom,
			users: [
				req.body.newUser
			
				]
			//user: user._id,
			//username: user.userna
		};
		//{$and:[{room: req.body.meetingRoomName},{task:req.body.roomtaskName}]}
		tasksCollection.findOne({$and:[{room: req.body.newRoom},{name:req.body.newTask}]},function(err, task){
			if(task){
				return res.status(400).send();
			}
			else {
		tasksCollection.insert(newTask, {w:1}, function(err, tasks){
			//var token = jwt.encode(user, JWT_SECRET);
			//return res.json({token: token});
			return res.send();
		});
			}
		});
	});
	//res.send();
});

//Function to insert messages
app.post('/messages', function(req, res, next){

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);
	//console.log(req.body.roomName);
	db.collection('messages', function(err, messagesCollection){
		var newMessage = {
			//room: req.body.newRoom,
			text: req.body.newMessage,
			user: user._id,
			username: user.username
			
		};
		messagesCollection.insert(newMessage, {w:1}, function(err, messages){
			io.emit('{text: req.body.newMessage}');
			return res.send();
		});
	});
	//res.send();
});

//Function to remove messages
app.put('/messages/remove', function(req, res, next){

	var token = req.headers.authorization;
	//console.log(token);
	var user = jwt.decode(token, JWT_SECRET);

	
	db.collection('messages', function(err, messagesCollection){
		var messageId = req.body.message._id;
		//console.log(user._id);
		messagesCollection.remove({_id: ObjectId(messageId), user: user._id}, {w:1}, function(err, result){
			//console.log(result);
			return res.send();
		});
	});
});

//function to add users
app.post('/users', function(req, res, next){
	db.collection('users', function(err, usersCollection){
		
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(req.body.password, salt, function(err, hash) {
		        // Store hash in your password DB. 
				var newUser = {
				username: req.body.username,
				password: hash,
                email:req.body.Email				
				};
				usersCollection.insert(newUser, {w:1}, function(err, messages){
				return res.send();
				});
		    });
		});

		
	});
	//res.send();
});

//function for signing in
app.put('/users/signin', function(req, res, next){
	//console.log(req.body.username);
	db.collection('users', function(err, usersCollection){
		usersCollection.findOne({username: req.body.username}, function(err, user){
			bcrypt.compare(req.body.password, user.password, function(err, result){
				if(result){
					var token = jwt.encode(user, JWT_SECRET);
					return res.json({token: token});
				}
				else{
					return res.status(400).send();
				}
			});
		});
	});
	//res.send();
});

//invite users
//tasksCollection.find({"array":{$in:[req.body.name]}}
//chatMessagesCollection.find({$and:[{room: req.body.meetingRoomName},{task:req.body.roomtaskName}]})
app.post('/invite/user', function(req, res, next){
	//console.log(req.body);
	
var userVar = {
			username: req.body.username
		};
		console.log(req.body.username);
		console.log(req.body.taskName);

		db.collection('users', function(err, usersCollection){
			usersCollection.findOne(userVar,function(err, user){
				if(user){
					db.collection('tasks', function(err, tasksCollection){
                        
						tasksCollection.find({$and:[{"users":{$in:[req.body.username]}},{name:req.body.taskName}]}).toArray(function(err, task){

						 	console.log(task);
							 console.log(task.length);
						if(task.length>0){
								return res.status(400).send();
							}
							else{
								console.log("get it");
						 		tasksCollection.update(
						// 		//{ name: req.body.taskName },
						// 		//{$and:[{name: req.body.roomtaskName} , { room: req.body.meetingRoomName}]},
						 		{name: req.body.taskName },
						 		{ $push: { users:  req.body.username } }
						 		);

// insert into room array
                         db.collection('rooms',function(err,roomCollection){

                                roomCollection.update(
						// 		//{ name: req.body.taskName },
						// 		//{$and:[{name: req.body.roomtaskName} , { room: req.body.meetingRoomName}]},
						 		{name: req.body.roomName },
						 		{ $push: { roomUsers:  req.body.username } }
						 		);



						 });



                  // node mailer code start
                                 
                             			  var transport = nodemailer.createTransport(smtpTransport({
      service: 'Gmail',
      auth: {
          user: "alimahmmod02@gmail.com",
          pass: "formanite" 
      },
      tls: {
        rejectUnauthorized: false
    }
    }));
 var mailOpts = {
      from: '<alimahmmod02@gmail.com>',
      to: "alimahmmod02@gmail.com",
      subject: 'Website contact form',
      text: 'hellooww',
       html: "<b>Hello!</b><p> Welcome to Hermius. ali has send you a request </p>"
  };
  transport.sendMail(mailOpts,function(error,result){
     if(error){
            console.log(error);
        }else{
            console.log("Message sent");
        }

        transport.close();


  });
 // node mailer code end  





								return res.send();
						}
						 });
                            
						
					});	
			}
				else{
					return res.status(404).send();
			}
			});
		});
		
});
// show user task and room
//chatMessagesCollection.find({$and:[{room: req.body.meetingRoomName},{task:req.body.roomtaskName}]})
//tasksCollection.find({$and:[{"users":{$in:[req.body.username]}},{name:req.body.taskName}]}).toArray(function(err, task)
//tasksCollection.find({"array":{$in:[req.body.name]}}
app.put('/show/loginUser',function(req,res,next){
db.collection('tasks', function(err, tasksCollection){
		tasksCollection.find({"users":{$in:[req.body.name]}}).toArray(function(err, tasks){
			//console.log(tasks);
			return res.json(tasks);
		});
		return	db.collection;
});

});

app.put('/show/loginUser/rooms',function(req,res,next){
db.collection('rooms', function(err, tasksCollection){
		tasksCollection.find({"roomUsers":{$in:[req.body.name]}}).toArray(function(err, tasks){
			console.log(tasks);
			return res.json(tasks);
		});
		return	db.collection;
});

});




// rough function
//db.coll.find({"tags" : { $in : ['etc1']  } } );
app.put('/rough/check',function(req,res,next){
db.collection('rough', function(err, tasksCollection){
		tasksCollection.find({"array":{$in:[req.body.name]}}).toArray(function(err, tasks){
			console.log(tasks.length);
			return res.json(tasks);
		});
		return	db.collection;
});

});


// function to get user based on task
app.put('/users/show', function(req, res, next) {
db.collection('tasks', function(err, tasksCollection){
		tasksCollection.find({name:req.body.roomtaskName}).toArray(function(err, tasks){
			return res.json(tasks);
		});
		return	db.collection;
});
});

// function to show profile
app.put('/show/User/profile', function(req, res, next){
	console.log( "print");
	db.collection('users', function(err, usersCollection){
		usersCollection.find({username: req.body.name}).toArray(function(err, users){
			//console.log(req.body.name);
			return res.json(users);
		});
		return	db.collection;
	});
});


app.listen(3015, function () {
  console.log('Example app listening on port 3015!');
});