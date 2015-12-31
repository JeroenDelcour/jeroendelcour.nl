var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser'); // not sure if needed
var bodyParser = require('body-parser');
var dateformat = require('dateformat');

var articleProvider = require("./articleprovider");
var authorized = require("./authorization");

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var articlesPerRequest = 5;

app.get('/', function(req, res, next) {
	res.render('about', { title: 'Jeroen Delcour' });
});

app.get('/about', function(req, res, next) {
	res.render('about', { title: 'Jeroen Delcour' });
});

app.route('/blog')
	.get(function(req, res){
		articleProvider.getArticles(articlesPerRequest, 0, function(error, rows){
				res.render('blog-list', {title: 'Jeroen Delcour', articles: rows});
		});
	})
	.post(function(req, res){
		articleProvider.getArticles(articlesPerRequest, req.body.requestNumber * articlesPerRequest, function(error, rows){
			if(rows.length > 0) {
				res.render('blog-list-append.jade', {articles: rows});
			} else {
				res.statusCode = 204;
				res.end();
			}
		});
	});

// needs to be called before app.get('/blog/:slug')
app.route('/blog/draft')
	.get(function(req, res){
		if (authorized(req)){
			res.render('blog-draft', { title: 'Draft | Jeroen Delcour', now: dateformat(new Date(), 'mmmm dS, yyyy')});
		} else {
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"');
			res.end('Access denied');
		}
	})
	.post(function(req, res){
		var credentials = auth(req);
		if (authorized(req)){
			articleProvider.save(req.body, function(error, articleSlug){
				res.redirect('/blog/'+articleSlug);
			})
		} else {
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"');
			res.end('Access denied');
		}
	});

app.get('/blog/:slug', function(req, res) {
	var slug = req.params.slug;
	articleProvider.findBySlug(slug, function(error, row){
		res.render('blog-article', { post: row });
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
