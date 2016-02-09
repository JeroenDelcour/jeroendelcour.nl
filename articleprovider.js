var fs = require("fs");
var sqlite3 = require("sqlite3");
var dateformat = require('dateformat');
var slug = require("slug");
var marked = require("marked");

marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

var dbfile = "blog.db";
var defaultDateMask = 'mmmm dS, yyyy';

if(!fs.existsSync(dbfile)) {
  console.log("Creating SQLite 3 database file '"+dbfile+"'.");
  fs.openSync(dbfile, "w");
  console.log("Creating table 'articles'.");
  var db = new sqlite3.Database(dbfile);
  db.run("CREATE TABLE articles (created TEXT, published TEXT, title TEXT, markdown TEXT, html TEXT, slug TEXT UNIQUE)");
  db.close();
};

module.exports = {

  getArticles: function(limit, offset, callback, dateMask) {
    if (dateMask == null) { dateMask = defaultDateMask }; // default dateMask value

    var db = new sqlite3.Database(dbfile);

    db.all("SELECT * FROM articles ORDER BY published DESC LIMIT "+limit+" OFFSET "+offset, function(error, rows) {
      if (error) {
        callback(error);
      } else {
        for (var i = 0; i < rows.length; i++) {
          var date = new Date(rows[i].published);
          rows[i].published = dateformat(date, dateMask);
        }
        callback(null, rows);
      }
      db.close();
    });
  },

  findBySlug: function(slug, callback, dateMask) {
    if (dateMask == null) { dateMask = defaultDateMask }; // default dateMask value

    var db = new sqlite3.Database(dbfile);

    db.get("SELECT * FROM articles WHERE slug='"+slug+"'", function(error, row) {
      if (error | row == undefined) {
        callback(error, row);
      } else {
        var date = new Date(row.published);
        row.published = dateformat(date, dateMask);
        callback(null, row);
      }
      db.close();
    });
  },

  save: function(article, callback) {
    db = new sqlite3.Database(dbfile);
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO articles VALUES (datetime('now'), datetime('now'), ?, ?, ?, ?)");
      var articleSlug = slug(article.title);
      stmt.run(article.title, article.body, marked(article.body), articleSlug);
      stmt.finalize();
      callback(null, articleSlug);
    });
    db.close();
  }
};
