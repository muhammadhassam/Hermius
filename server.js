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

var JWT_SECRET = 'hermeszeus';

var db = null;
//var messages;
MongoClient.connect("mongodb://localhost:27017/hermius", function(err, dbconn){
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
	console.log('IO CONNECTION SUCCESSFUL');
});



app.put('/messages', function(req, res, next){

	db.collection('messages', function(err, messagesCollection){
		console.log(req.body.taskName+"yepo"+req.body.roomName);
		messagesCollection.find({$and:[{room: req.body.roomName} , { task: req.body.taskName}]}).toArray(function(err, messages){
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


// //Function to get chat messages by Room Name && task Name for Front Angular Page
// app.put('/chat/messages/taskNameAng', function(req, res, next){
// 	db.collection('chatMessages', function(err, chatMessagesCollection){
// 		//console.log("Hello 2");
// 		console.log(req.body.roomtaskName+" yellow");
// 		chatMessagesCollection.find({task: req.body.roomtaskName }).toArray(function(err, chatMessages){
// 			//console.log(chatMessages.text);
// 			//console.log(chatMessages);
// 			return res.json(chatMessages);
// 		});
// 		return	db.collection;
// 	});
// });

//Function to get chat messages by Room Name && task Name for Front Angular Page
app.put('/chat/messages/taskNameAng', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		//console.log("Hello 2");
		//console.log(req.body.roomtaskName+" yellow");
		chatMessagesCollection.find({$and:[{task: req.body.roomtaskName} , { room: req.body.meetingRoomName}]}).toArray(function(err, chatMessages){
			//console.log(chatMessages.text);
			//console.log(chatMessages);
			return res.json(chatMessages);
		});
		return	db.collection;
	});
});
//Function to get chat messages by Room and task
app.put('/chat/messages/roomandtask', function(req, res, next){
	db.collection('chatMessages', function(err, chatMessagesCollection){
		console.log("Checking task name: "+ req.body.roomtaskName);
		//console.log("Checking task name2 : "+ req.body.meetingTaskName); //Desn't work
		chatMessagesCollection.find({$and:[{task: req.body.roomtaskName} , { room: req.body.meetingRoomName}]}).toArray(function(err, chatMessages){
			///console.log(chatMessages.text);
			//console.log(chatMessages.text);
			return res.json(chatMessages);
		});
		return	db.collection;
	});
});
//Function to get Links by Room and task
app.put('/chat/links/roomandtask', function(req, res, next){
	db.collection('links', function(err, linksCollection){
		//console.log("Checking task name: "+ req.body.roomtaskName);
		//console.log("Checking task name2 : "+ req.body.meetingTaskName); //Desn't work
		linksCollection.find({$and:[{task: req.body.roomtaskName} , { room: req.body.meetingRoomName}]}).toArray(function(err, links){
			///console.log(chatMessages.text);
			//console.log(chatMessages.text);
			return res.json(links);
		});
		return	db.collection;
	});
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


//Function to insert LINKS
app.post('/chat/links', function(req, res, next){
	
	var now = new Date();
	var jsonDate = now.toJSON();

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);

	//console.log(req.body.newChatMessage);
	//console.log(req.body.newRoom);
	//console.log(req.body.taskName+"HELLOOOOOWDKJLKDJS");
	console.log(req.body.newLabel+ "Yo");
	db.collection('links', function(err, linksCollection){
		var newLink = {
			//room: req.body.newRoom,
			text: req.body.newLink,
			label: req.body.newLabel,
			username: user.username,
			room: req.body.roomName,
			task: req.body.taskName,
			date: jsonDate
			//roomId: room._id
		};
		linksCollection.insert(newLink, {w:1}, function(err, newLink){
			io.emit('{text: req.body.newLink}');
			return res.send();
		});
	});
	//res.send();
});


//Function to select Room name
app.put('/newRoom', function(req, res, next){

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);
	//console.log(req.body.newRoom);
	db.collection('rooms', function(err, roomsCollection){
		var newRoom = {
			//room: req.body.newRoom,

			name: req.body.newRoom
			//user: user._id,
			//username: user.username
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
});

app.post('/room/task/user', function(req, res, next){
	//db.collection('tasks', function(err, tasksCollection){

		var userVar = {
			username: req.body.username
		};
		console.log("userVar: "+userVar);

		db.collection('users', function(err, usersCollection){
			usersCollection.findOne(userVar,function(err, user){
				if(user){
					db.collection('tasks', function(err, tasksCollection){

						// var username = 
						
						// {
						// 	users:{$elemMatch: {username: req.body.username}
						// };

						// tasksCollection.find({users:{$elemMatch: {username: req.body.username}}},function(err, user){
						// 	console.log(user);
						// 	if(user){
						// 		return res.status(400).send();
						// 	}
						// 	else{
								tasksCollection.update(
								//{ name: req.body.taskName },
								//{$and:[{name: req.body.roomtaskName} , { room: req.body.meetingRoomName}]},
								{name: req.body.taskName },
								{ $push: { users:  { username: req.body.username } } }
								)
								return res.send();
						// 	}
						// });

						
					});	
				}
				else{
					return res.status(404).send();
				}
			});
		});
		console.log(req.body);
		//chatMessagesCollection.find({$and:[{task: req.body.roomtaskName} , { room: req.body.meetingRoomName}]}).toArray(function(err, chatMessages){
	//});
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
				{
					username: req.body.newUser
				}
				]
			//user: user._id,
			//username: user.username
		};
		tasksCollection.insert(newTask, {w:1}, function(err, tasks){
			//var token = jwt.encode(user, JWT_SECRET);
			//return res.json({token: token});
			return res.send();
		});

	});
	//res.send();
});

//Function to insert messages
app.post('/messages', function(req, res, next){

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);
	//console.log("RoomName: "+req.body.roomName+", TaskName: "+req.body.taskName);
	db.collection('messages', function(err, messagesCollection){
		var newMessage = {
			//room: req.body.newRoom,
			text: req.body.newMessage,
			user: user._id,
			username: user.username,
			room: req.body.roomName,
			task: req.body.taskName
			
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
				password: hash
				
				};
				usersCollection.insert(newUser, {w:1}, function(err, messages){
				return res.send();
				});
		    });
		});

		
	});
	//res.send();
});


//Function to search users
app.get('/users/find', function(req, res, next){
	db.collection('users', function(err, usersCollection){
		usersCollection.find().toArray(function(err, users){
			return res.json(users);

		});
		return	db.collection;
	});
});

//Function to search users based on tasks
app.get('/users/find/task', function(req, res, next){
	db.collection('tasks', function(err, tasksCollection){
		tasksCollection.find({users}).toArray(function(err, users){
			return res.json(users);
		});
		return	db.collection;
	});
});


//function for signing in
app.put('/users/signin', function(req, res, next){
	console.log(req.body.username);
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

app.listen(3015, function () {
  console.log('Example app listening on port 3015!');
});

