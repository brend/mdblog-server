const HTTP_PUBLIC = '../MdBlog/dist/MdBlog/';
const API = '/api/v1'
const POSTS = '../posts/';
const port = 8080;

const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');

var app = express();

/////////// blog frontend ///////////

app
    .use(compression())
    .use(bodyParser.json())
    // Static content
    .use(express.static(HTTP_PUBLIC))
    // Default route
    .get('/', function(req, res) {
      res.sendFile(HTTP_PUBLIC + 'index.html');
    })
    // Start server
    .listen(port, function () {
        console.log('Port: ' + port);
        console.log('Html: ' + HTTP_PUBLIC);
    });

/////////// API ///////////

app.get(`${API}/:id`, (req, res) => {
    res.send(`Fetching blog post ${req.params.id}`);
});