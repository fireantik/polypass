'use strict';

console.log("Starting server");
var production = process.env.NODE_ENV == "prod" || process.env.NODE_ENV == "production";

var express = require('express');
var db = require('./db.js');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var getRawBody = require('raw-body');
var Crypto = require(__dirname + '/../common/Crypto.js');
var fs = require('fs');
var compression = require('compression')
var compiler = require('./compiler.js');
if(!production) compiler.watch();
else compiler.readOnly();


var app = express();


app.use(compression());
app.use(express.static(__dirname + '/../static'));
app.use(express.static(__dirname + '/../dist', {maxAge: 1000 * 60 * 60 * 24 * 365}));

function makeScripts(scripts){
	var out = "";
	scripts.forEach(function(script){
		out += "<script src='/" + compiler.entries[script] + "'></script>\n";
	});
	return out;
}

app.get('/', function(req, res){
	fs.readFile(__dirname + '/index.html', function (err, data) {
		if (err) throw err;
		var text = data.toString('utf-8')
			.replace('{{preload}}', encodeURIComponent(JSON.stringify(compiler.files)))
			.replace('{{scripts}}', makeScripts(["vendor", "app"]));
		res.send(text);
	});
});

app.get('/info/:username', function (req, res) {
    db.User.findOne({where: {name: req.params.username}})
    .then(function(user){
        if(!user) return res.json({error: "Username not found"}).end();
        res.json({
            pub: user.pub,
            priv: user.priv,
            uid: user.uid,
            salt: user.salt
        });
    }).catch(function(err){
        return res.status(404).end('Error ' + err.message);
    });
});

app.post('/register', bodyParser.urlencoded({extended: true}), function (req, res) {
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
    if(!Number.isInteger(decoded.uid)) return res.status(400).end('UID missing or invalid');
    if(typeof decoded.data != "object") return res.status(400).end('Data missing or invalid');
    if(!Number.isInteger(decoded.expires)) return res.status(400).end('Expiration date missing or invalid');

    db.User.findById(decoded.uid).then(function(user){
        if(!user) return res.status(400).end('Unknown user');
        jwt.verify(req.headers.authorization, user.pub, function(err, d){
            if(err) return res.status(401).end('Error while verifying JWT');
            if(d.expires < Date.now()) return res.status(401).end('Token expired');
            req.jwt = d.data;
            req.jwt.uid = d.uid;
            next();
        });
    }).catch(function(ex){
        return res.status(400).end(ex.message);
    });
}

app.use('/block', function (req, res, next) {
    getRawBody(req, {
        limit: '25mb'
    }).then(function(body){
        console.log(body);
        console.log(body.toString('hex'));
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
    if(typeof req.jwt.bid == "undefined") return res.status(400).end('Missing block id');

    db.Block.findOne({where: {uid: req.jwt.uid, bid: req.jwt.bid}}).then(function(block){
        if(!block) return res.status(400).end('Block not found');
        res.set('Content-Type', 'application/octet-stream');
        res.send(block.data.toString('base64'));
    });
});

var IP = process.env.IP || "0.0.0.0";
var PORT = process.env.PORT || 3000;

var server = app.listen(PORT, IP, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
