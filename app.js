var express = require('express'); var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser'); // not sure if needed
var bodyParser = require('body-parser');
var dateformat = require('dateformat');

var articleProvider = require("./articleprovider");
var authorized = require("./authorization");
var electionData = require("./2016election");

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
			if (error | rows == undefined) {
				res.statusCode = 500;
				res.end;
			} else {
				res.render('blog', {title: 'Jeroen Delcour', articles: rows});
			}
		});
	})
	.post(function(req, res){
		articleProvider.getArticles(articlesPerRequest, req.body.requestNumber * articlesPerRequest, function(error, rows){
			if(rows.length > 0) {
				res.render('blog-list.jade', {articles: rows});
			} else {
				res.statusCode = 204;
				res.end();
			}
		});
	});

// needs to be called before app.get('/blog/:slug')
app.post('/blog/draft/save', function(req, res){
	if (authorized(req)){
		articleProvider.save(req.body, function(error, row){
			if (error) {
				res.statusCode = 500;
				res.send(error.message);
			} else {
				if (row){
					res.send(String(row.rowid));
				} else {
					res.end();
				}
			}
		});
	} else {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"');
		res.end('Access denied');
	}
});
app.post('/blog/draft/delete', function(req, res){
	if (authorized(req)){
		articleProvider.delete(req.body.rowid, function(error){
			if (error) {
				res.statusCode = 500;
				res.render('error', {
					message: error.message,
					error: error
				});
			} else {
				res.statusCode = 200;
				res.send();
			}
		});
	} else {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"');
		res.end('Access denied');
	}
});
app.post('/blog/draft/publish', function(req, res){
	if (authorized(req)){
		articleProvider.publish(req.body, function(error, row){
			if (error | row == undefined) {
				res.statusCode = 500;
				res.render('error', {
					message: error.message,
					error: error
				});
			} else {
				res.statusCode = 200;
				res.end('Published!');
			}
		})
	}
});
app.get('/blog/draft', function(req, res){
	if (authorized(req)){
		articleProvider.getDrafts(function(error, rows) {
			if (error | rows == undefined) {
				res.statusCode = 500;
				res.end();
			} else {
				res.render('blog-draft', { title: 'Draft | Jeroen Delcour', drafts: rows, now: dateformat(new Date(), 'mmmm dS, yyyy')});
			}
		})
	} else {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"');
		res.end('Access denied');
	}
});
app.route('/blog/edit')
	.get(function(req, res){
		if (authorized(req)){
			articleProvider.getArticles(9999, 0, function(error, rows) {
				if (error | rows == undefined) {
					res.statusCode = 500;
					res.end();
				} else {
					res.render('blog-edit', { title: 'Edit | Jeroen Delcour', drafts: rows, now: dateformat(new Date(), 'mmmm dS, yyyy')});
				}
			})
		} else {
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"');
			res.end('Access denied');
		}
	})
	.post(function(req, res) {
		if (authorized(req)){
			articleProvider.edit(req.body, function(error){
				if (error) {
					res.statusCode = 500;
					res.send(error.message);
				} else {
					res.end();
				}
			});
		} else {
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"');
			res.end('Access denied');
		}
	});

app.get('/blog/:slug', function(req, res, next) {
	var slug = req.params.slug;
	articleProvider.findBySlug(slug, function(error, row){
		if (error) {
			res.statusCode = 500;
			res.end();
		} else if (row == undefined) {
			err = new Error('Not found');
			err.status = 404;
			next(err);
		} else {
			res.render('blog-article', { post: row , title: row.title});
		};
	});
});

app.get('/2016election/data/:candidate', function(req, res) {
	var candidate = req.params.candidate;
	electionData.getData(candidate, function(error, data) {
		if (error) {
			res.statusCode = 500;
			res.end();
		} else {
			res.send(data);
		}
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
