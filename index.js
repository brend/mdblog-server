const HTTP_PUBLIC = '../MdBlog/dist/MdBlog/';
const API = '/api/v1'
const POSTS = '../posts';
const port = 8080;

const postPath = (filename) => {
    return `${POSTS}/${filename}`;
};

const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');

const fs = require('fs');

var app = express();

/////////// global header, MUST come first ///////////

app.get('/*',function(req,res,next){
    res.header('Access-Control-Allow-Origin' , 'http://localhost:4200');
    next();
});

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

app.get(`${API}/post`, (req, res) => {
    const posts = fs.readdirSync(POSTS).map(filename => { return {id: filename, title: filename} });

    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(posts));
});

app.get(`${API}/post/:id`, (req, res) => {
    const path = postPath(req.params.id);

    // TODO: sanitize/reject res, if contains "/" etc
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('server error');
                }

                // check if file not too large etc
                res.setHeader('content-type', 'application/json');
                res.send({id: req.params.id, text: data});
            });
        } else {
            res.status(404).send('post not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

app.post(`${API}/post/:id`, (req, res) => {

    if (!req.body) {
        console.error('request body missing');
        res.status(400).send('bad request');
        return;
    }

    const path = postPath(req.params.id);

    // TODO: check if valid file name etc
    // TODO: check if body (file data) is ok, not too large, harmless, what have you
    try {
        fs.writeFile(path, JSON.stringify(req.body), () => {
            res.status(200).send('post saved');
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
});