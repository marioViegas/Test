var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs')
var db = mongojs('customerapp', ['users'])
var ObjectId = mongojs.ObjectId;
var app = express();

/*var logger = function(req, res, next){
	console.log('Logging...');
	next();
}

app.use(logger);*/

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

app.get('/', function(req, res){
	// find everything
	db.users.find(function (err, docs) {
		// docs is an array of all the documents in mycollection
		res.render('index',{
			title: 'Costumers',
			users: docs
		});
	})
});

app.post('/users/add', function(req, res){

	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('last_name', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		db.users.find(function (err, docs) {
			// docs is an array of all the documents in mycollection
			res.render('index',{
				title: 'Costumers',
				users: docs,
				errors: errors
			});
		})
	} else {
		var newUser = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email
		}

		db.users.insert(newUser, function(err, response){
			if(err){
				console.log(err);
			}
			res.redirect('/');
		});
	}
});

app.delete('/users/delete/:id', function(req, res){
	db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
		if(err){
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

app.listen(3000, function(){
	console.log('server started on port 3000...');
})
