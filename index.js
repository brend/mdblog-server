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

function success(message, postId) {
    return {success: true, message: message, postId: postId};
}

function failure(message) {
    return {success: false, message: message};
}

/////////// global header, MUST come first ///////////

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
    const postId = req.params.id;
    const path = postPath(postId);

    // TODO: sanitize/reject res, if contains "/" etc
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    res.status(500).send(failure('server error'));
                    return;
                }

                const title = titleify(postId);

                // check if file not too large etc
                res.setHeader('content-type', 'application/json');
                res.send({id: postId, title: title, text: data});
            });
        } else {
            res.status(404).send(failure('post not found'));
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(failure('server error'));
    }
});

app.post(`${API}/post`, (req, res) => {
    if (!req.body) {
        console.error('request body missing');
        res.status(400).send(failure('bad request'));
        return;
    }

    const postId = filenameify(req.body.title);
    const path = postPath(postId);

    // TODO: check if valid file name etc
    // TODO: check if body (file data) is ok, not too large, harmless, what have you
    try {
        if (fs.existsSync(path)) {
            console.error('post already exists', path);
            res.status(404).send(failure('post already exists'));
            return;
        }

        fs.writeFile(path, req.body.contents, () => {
            res.status(200).send(postId);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send(failure('server error'));
    }
});

app.patch(`${API}/post/:id`, (req, res) => {
    if (!req.body) {
        console.error('request body missing');
        res.status(400).send(failure('bad request'));
        return;
    }

    console.log('body', req.body);
    
    const postId = req.params.id;
    const path = postPath(postId);
    const newPostId = filenameify(req.body.title);
    const newPath = postPath(newPostId);

    if (!fs.existsSync(path)) {
        console.error('post not found', path);
        res.status(404).send(failure('post not found'));
        return;
    }

    if (path != newPath) {
        // make sure file can be safely renamed
        if (fs.existsSync(newPath)) {
            console.error('a post with the requested title already exists', newPath);
            res.status(404).send('a post with the requested title already exists');
            return;
        }

        // try to rename file
        try {
            fs.renameSync(path, newPath);
        } catch (error) {
            console.error('renaming the post failed', error);
            res.status(500).send('renaming the post failed');
            return;
        }
    }

    // replace file contents
    try {
        fs.writeFile(newPath, req.body.contents, () => {
            res.status(200).send(newPostId);
        })
    } catch (error) {
        console.error(error);
        res.status(500).send(failure('server error'));
    }
});