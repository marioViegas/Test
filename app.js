var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users', 'user']);
var ObjectId = mongojs.ObjectId;
const Instagram = require('node-instagram').default;
var app = express();

/*var logger = function(req, res, next){
	console.log('Logging...');
	next();
}

app.use(logger);*/

// Create a new instance.
const instagram = new Instagram({
  clientId: '13837ff160e0401cbb4642750dca8166',
  clientSecret: 'fd266d2a52164d06b60fdc2d99621725',
});

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Static path
app.use(express.static(path.join(__dirname, 'public')));

// Express Validator Middleware
app.use(expressValidator());﻿

app.use(function(req, res, next){
	res.locals.errors = null;
	next();
});

app.get('/a', function(req, res){
	// find everything
	db.users.find(function (err, docs) {
		// docs is an array of all the documents in mycollection
		res.render('index',{
			title: 'Costumers',
			users: docs
		});
	})
});

app.get('/', function(req, res){
	res.render('login');
});

const redirectUri = 'http://localhost:3000/auth/instagram/callback';

app.get('/login', function(req, res){
	res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: ['basic'] }));
});

// Handle auth code and get access_token for user
app.get('/auth/instagram/callback', async (req, res) => {
  try {
    const data = await instagram.authorizeUser(req.query.code, redirectUri);
    // access_token in data.access_token
		console.log(data.user);
    res.json(data);
		db.user.insert(data.user, function(err, response){
			if(err){
				console.log(err);
			}
			console.log(response);
			//res.redirect('/');
		});
  } catch (err) {
    res.json(err);
  }
});

app.post('/users/add', function(req, res){

	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('last_name', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		db.users.find(function (err, docs) {
			// docs is an array of all the documents in mycollection
			console.log(docs);
			res.render('index',{
				title: 'Costumers',
				users: docs,
				errors: errors
			});
		})
	} else {
		console.log(req);
		var newUser = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email
		}

		db.users.insert(newUser, function(err, response){
			if(err){
				console.log(err);
			}
			console.log(response);
			res.redirect('/');
		});
	}
});

app.delete('/users/delete/:id', function(req, res){
	db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
		if(err){
			console.log(err);
		} else {
			console.log(res);
			res.redirect('/');
		}
	});
});

app.listen(3000, function(){
	console.log('server started on port 3000...');
})
