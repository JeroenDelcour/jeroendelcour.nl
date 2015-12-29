var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser'); // not sure if needed
var bodyParser = require('body-parser');
var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var auth = require('basic-auth');
var dateformat = require('dateformat');
var slug = require("slug");
var marked = require("marked");
var md5 = require("md5");

var articleProvider = require("./articleprovider");
var authorized = require("./authorization");

marked.setOptions({
	highlight: function (code) {
		return require('highlight.js').highlightAuto(code).value;
	}
});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var dbfile = "blog.db";

if(!fs.existsSync(dbfile)) {
	console.log("Creating SQLite 3 database file '"+dbfile+"'.");
	fs.openSync(dbfile, "w");
	console.log("Creating table 'articles'.");
	var db = new sqlite3.Database(dbfile);
	db.run("CREATE TABLE articles (created TEXT, published TEXT, title TEXT, markdown TEXT, html TEXT, slug TEXT UNIQUE)");
	db.close();
};

app.get('/', function(req, res, next) {
	res.render('about', { title: 'Jeroen Delcour' });
});

app.get('/about', function(req, res, next) {
	res.render('about', { title: 'Jeroen Delcour' });
});

app.get('/blog', function(req, res){
	// var db = new sqlite3.Database(dbfile);

	// db.all("SELECT * FROM articles ORDER BY published DESC", function(err, rows) {
	// 	for (var i = 0; i < rows.length; i++) {
	// 		var date = new Date(rows[i].published);
	// 		rows[i].published = dateformat(date, 'mmmm dS, yyyy');
	// 	}
	// 	res.render('blog-list', {tite: 'Jeroen Delcour', articles: rows});
	// 	db.close();
	// });
	articleProvider.getArticles(5, 0, function(error, rows){
			res.render('blog-list', {title: 'Jeroen Delcour', articles: rows});
	});
});

// needs to be called before app.get('/blog/:slug')
app.route('/blog/draft')
	.get(function(req, res){
		// var credentials = auth(req);
	 //  if (!credentials || !authorization(credentials.name, md5(credentials.pass))) {
	 //    res.statusCode = 401
	 //    res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"')
	 //    res.end('Access denied')
	 //  } else {
		// 	res.render('blog-draft', { title: 'Draft | Jeroen Delcour', now: dateformat(new Date(), 'mmmm dS, yyyy')});
	 //  }
		if (authorized(req)){
			res.render('blog-draft', { title: 'Draft | Jeroen Delcour', now: dateformat(new Date(), 'mmmm dS, yyyy')});
		} else {
			res.statusCode = 401
			res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"')
			res.end('Access denied')
		}
	})
	.post(function(req, res){
		var credentials = auth(req);
		if (!credentials || !authorization(credentials.name, md5(credentials.pass))) {
			res.statusCode = 401
			res.setHeader('WWW-Authenticate', 'Basic realm="Who goes there?"')
			res.end('Access denied')
		} else {
			// db = new sqlite3.Database(dbfile);
			// db.serialize(function() {
			// 	var stmt = db.prepare("INSERT INTO articles VALUES (datetime('now'), datetime('now'), ?, ?, ?, ?)");
			// 	var articleSlug = slug(req.body.title);
			// 	stmt.run(req.body.title, req.body.body, marked(req.body.body), articleSlug);
			// 	stmt.finalize();
			// 	res.redirect('/blog/'+articleSlug);
			// });
			// db.close();
			articleProvider.save(req.body, function(error, articleSlug){
				res.redirect('/blog/'+articleSlug);
			})
		}
	});

app.get('/blog/:slug', function(req, res) {
	// var slug = req.params.slug;
	// var db = new sqlite3.Database(dbfile);
	// db.get("SELECT * FROM articles WHERE slug='"+slug+"'", function(err, row) {
	// 	var date = new Date(row.published);
	// 	row.published = dateformat(date, 'mmmm dS, yyyy');
	// 	res.render('blog-article', { post: row });
	// 	db.close();
	// });
	
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
