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

const {titleify, filenameify} = require('./titleify.js');

var app = express();

/////////// global header, MUST come first ///////////

// app.get('/*',function(req,res,next){
//     res.header('Access-Control-Allow-Origin' , 'http://localhost:4200');
//     next();
// });

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
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
    const posts = fs.readdirSync(POSTS)
        .filter(filename => filename.endsWith('.md'))
        .map(filename => { return {id: filename, title: titleify(filename)} });

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

app.post(`${API}/post`, (req, res) => {
    if (!req.body) {
        console.error('request body missing');
        res.status(400).send('bad request');
        return;
    }

    const postId = filenameify(req.body.title);
    const path = postPath(postId);

    // TODO: check if valid file name etc
    // TODO: check if body (file data) is ok, not too large, harmless, what have you
    try {
        if (fs.existsSync(path)) {
            console.error('post already exists', path);
            res.status(404).send('post already exists');
            return;
        }

        fs.writeFile(path, req.body.contents, () => {
            res.status(200).send('post created');
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

app.patch(`${API}/post/:id`, (req, res) => {
    if (!req.body) {
        console.error('request body missing');
        res.status(400).send('bad request');
        return;
    }

    const path = postPath(req.params.id);

    if (!fs.existsSync(path)) {
        console.err('post not found', path);
        res.status(404).send('post not found');
        return;
    }

    try {
        fs.writeFile(path, JSON.stringify(req.body), () => {
            res.status(200).send('post updated');
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
});