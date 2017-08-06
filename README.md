# jeroendelcour.nl
Personal website / CMS exercise

A very basic content management system (CMS) for my small personal website. *Far* from being well-put-together - built it mostly as an exercise. Don't try this at home, kids!

Since I wasn't sure what my hosting situation would be like for the foreseeable future, I wanted to set it up such that I can just copy-paste the entire folder structure, launch the server, and be up and running. The only requirement for the host machine is that it has Node.js installed.

Slight addendum: On my server I've set up a startup bash script to relaunch the server in case of unexpected reboots of the host machine.

# Structure
Runs on Node.js using the Express framework.

Blog posts are written in Markdown and stored in a `drafts` table in an SQLite3 database. When published, they are moved to the `articles` table and a unique title slug is generated. When visiting `jeroendelcour.nl/blog/some-title-slug`, the slug in the URL is used by the functions defined in `articleprovider.js` to query the specified blog post from the database. The query results are sent along to the `blog-article` view (`view`s are part of how Express works). The view combines all the relevant HTML layout stuff (header, etc.) with the blog post HTML before sending the final page to the visitor.

# To-do:
- Build easy way of adding images to blog posts (currently they are uploaded manually using FTP to the `public` folder, and URLs are copy-pasted into blog posts Markdown)
- Add mathematical notation using [MathJax](https://www.mathjax.org/)
