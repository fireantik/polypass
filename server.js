'use strict';

var express = require('express');
var db = require('./db.js');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var browserify = require('browserify-middleware');
var getRawBody = require('raw-body');
var concat = require('concat-stream');
var Crypto = require('./crypto.js');
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
    if(!req.headers.authorization) return res.status(401).end('Authorization missing');
    console.log("authorizing");

    var decoded;
    try {
        decoded = jwt.decode(req.headers.authorization);
    }
    catch(ex) {
        return res.status(500).end('Error while decoding JWT');
    }

    if(!decoded.uid) return res.status(400).end('UID missing');
    if(!decoded.data) return res.status(400).end('Data missing');
    if(!decoded.expires) return res.status(400).end('Expiration date missing');

    db.User.findById(decoded.uid).then(function(user){
        if(!user) return res.status(400).end('Unknown user');
        jwt.verify(req.headers.authorization, user.pub, function(err, d){
            if(err) return res.status(401).end('Error while verifying JWT');
            if(d.expires < Date.now()) return res.status(401).end('Token expired');
            req.jwt = d.data;
            req.jwt.uid = d.uid;
            next();
        });
    });
}

app.use('/block', function (req, res, next) {
    console.log("getrawbody");
    getRawBody(req, {
        limit: '25mb'
    }).then(function(body){
        req.body = body;
        next();
    }).catch(function(err){
        if(err) return res.status(500).send("Error while parsing body\n").end(err.message);
    });
});

app.put('/block', authorize, function(req, res){
    if(typeof req.jwt.bid == "undefined" || typeof req.jwt.checksum == "undefined") return res.status(400).end('Missing block id or checksum');
    var checkSum = new Buffer(req.jwt.checksum, 'hex');
    if(!Crypto.checkSum(req.body).equals(checkSum)) return res.status(400).end('Checksum invalid');

    db.Block.insertOrUpdate({uid: req.jwt.uid, bid: req.jwt.bid, data: req.body}).then(function(block){
        return res.json({success: true});
    });
});

app.get('/block', authorize, function(req, res) {
    console.log("get");
    if(typeof req.jwt.bid == "undefined") return res.status(400).end('Missing block id');

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