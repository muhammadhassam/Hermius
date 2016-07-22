var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var app = express();

var JWT_SECRET = 'hermeszeus';

var db = null;
//var messages;
MongoClient.connect(process.env.MONGOLAB_URI || "mongodb://localhost:27017/hermius", function(err, dbconn){
	if (!err) {
		console.log("We are connected");
		db = dbconn;
	}
});

app.use(bodyParser.json());

app.use(express.static('public'));


app.get('/messages', function(req, res, next){
	db.collection('messages', function(err, messagesCollection){
		messagesCollection.find().toArray(function(err, messages){
			return res.json(messages);

		});
		return	db.collection;
	});
});


//Function to insert messages
app.post('/messages', function(req, res, next){

	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);
	
	db.collection('messages', function(err, messagesCollection){
		var newMessage = {
			text: req.body.newMessage,
			user: user._id,
			username: user.username
		};
		messagesCollection.insert(newMessage, {w:1}, function(err, messages){
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

//function for signing in
app.put('/users/signin', function(req, res, next){
	db.collection('users', function(err, usersCollection){
		usersCollection.findOne({username: req.body.username, }, function(err, user){
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

app.listen(3003, function () {
  console.log('Example app listening on port 3003!');
});