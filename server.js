'use strict';

var express = require('express');
var db = require('./db.js');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var browserify = require('browserify-middleware');
var app = express();

app.use(express.static('./static'));
app.get('/app.js', browserify(__dirname + '/client.js'));

app.get('/info/:username', function (req, res) {
    db.User.findOne({username: req.params.username})
    .then(function(user){
        if(!user) return res.status(404).end('Username not found');
        res.json({
            pub: user.pub,
            priv: user.priv,
            uid: user.uid,
            salt: user.salt
        });
    })
});

app.post('/register', bodyParser.urlencoded(), function (req, res) {
    if(!req.body.username || !req.body.pub || !req.body.priv || !req.body.salt) return res.status(400).end('Invalid data');

    var query = {
        where: {name: req.body.username},
        defaults: {
            pub: req.body.pub,
            priv: req.body.priv,
            salt: req.body.salt
        }
    };

    db.User.findOrCreate(query)
    .then(function(arr){
        var user = arr[0];
        var created = arr[1];

        if(!created) return res.json({err: "User already exists"});
        res.json({uid: user.uid});
    }).catch(function(ex) {
        console.log(ex);
        return res.status(500).end('Validation error');
    });
});

function authorize(req, res, next){
    if(!req.headers.Authorization) return res.status(401).end('Authorization missing');

    var decoded;
    try {
        decoded = jwt.decode(req.headers.Authorization);
    }
    catch(ex) {
        return res.status(500).end('Error while decoding JWT');
    }

    if(!decoded.uid) return res.status(400).end('UID missing');

    db.User.findById(decoded.uid).then(function(user){
        if(!user) return res.status(400).end('Unknown user');
        jwt.verify(req.headers.Authorization, user.pub, function(err, d){
            if(err) return res.status(401).end('Error while verifying JWT');
            req.jwt = d;
            next();
        });
    });
}

app.use('/block', function (req, res, next) {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: '50mb'
    });
});

app.put('/block', authorize, function(req, res){
    if(!req.jwt.bid) return res.status(400).end('Missing block id');

    db.Block.insertOrUpdate({uid: req.jwt.uid, bid: req.jwt.bid, data: req.body}).then(function(block){
        return res.json({success: true});
    });
});

app.get('/block', authorize, function(req, res) {
    if(!req.jwt.bid) return res.status(400).end('Missing block id');

    db.Block.findOne({where: {uid: req.jwt.uid, bid: req.jwt.bid}}).then(function(block){
        if(!block) return res.status(400).end('Block not found');
        res.send(block.data);
    });
});

var IP = process.env.IP || "0.0.0.0";
var PORT = process.env.PORT || 3000;

var server = app.listen(PORT, IP, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});