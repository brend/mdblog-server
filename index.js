const HTTP_PUBLIC = '../MdBlog/dist/MdBlog/';
const port = 8080;

const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');

var app = express();

app
    .use(compression())
    .use(bodyParser.json())
    // Static content
    .use(express.static(HTTP_PUBLIC))
    // Default route
    .use(function(req, res) {
      res.sendFile(HTTP_PUBLIC + 'index.html');
    })
    // Start server
    .listen(port, function () {
        console.log('Port: ' + port);
        console.log('Html: ' + HTTP_PUBLIC);
    });