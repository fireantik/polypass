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
var compression = require('compression');
var compiler = require('./compiler.js');
if (!production) compiler.watch();
else compiler.readOnly();

var checksum = require('checksum');
var fs = require('fs');
var path = require('path');
var mv = require('mv');

var multer  = require('multer');
var upload = multer({ dest: require('os').tmpdir() });


var app = express();


app.use(compression());
app.use(express.static(__dirname + '/../static'));
app.use(express.static(__dirname + '/../dist', {maxAge: 1000 * 60 * 60 * 24 * 365}));
app.use("/blocks/", express.static(__dirname + '/../blocks', {maxAge: 1000 * 60 * 60 * 24 * 365}));

function makeScripts(scripts) {
	var out = "";
	scripts.forEach(function (script) {
		out += "<script src='/" + compiler.entries[script] + "'></script>\n";
	});
	return out;
}

app.get('/(|offline)', function (req, res) {
	fs.readFile(__dirname + '/index.html', function (err, data) {
		if (err) throw err;
		var text = data.toString('utf-8')
			.replace('{{scripts}}', makeScripts(["app"]));

		res.send(text);
	});
});

app.get('/appcache', function (req, res) {
	res.send(compiler.manifestFile);
});

app.get('/info/:username', function (req, res) {
	db.User.findOne({where: {name: req.params.username}})
		.then(function (user) {
			if (!user) return res.json({error: "Username not found"}).end();
			res.json({
				pub: user.pub,
				priv: user.priv,
				uid: user.uid,
				salt: user.salt,
				mainBlock: user.mainBlock
			});
		}).catch(function (err) {
		return res.status(400).end('Error ' + err.message);
	});
});

app.post('/register', bodyParser.urlencoded({extended: true}), function (req, res) {
	if (!req.body.username || !req.body.pub || !req.body.priv || !req.body.salt) return res.status(400).end('Invalid data');

	var query = {
		where: {name: req.body.username},
		defaults: {
			pub: req.body.pub,
			priv: req.body.priv,
			salt: req.body.salt,
			primaryBlock: null
		}
	};

	db.User.findOrCreate(query)
		.then(function (arr) {
			var user = arr[0];
			var created = arr[1];

			if (!created) return res.json({err: "User already exists"});
			res.json({uid: user.uid});
		}).catch(function (ex) {
		console.log(ex);
		return res.status(500).end('Validation error');
	});
});

function authorize(req, res, next) {
	if (!req.headers.authorization) return res.status(401).end('Authorization missing');
	console.log("authorizing");

	var decoded;
	try {
		decoded = jwt.decode(req.headers.authorization);
	}
	catch (ex) {
		return res.status(500).end('Error while decoding JWT');
	}
	if (!Number.isInteger(decoded.uid)) return res.status(400).end('UID missing or invalid');
	if (typeof decoded.data != "object") return res.status(400).end('Data missing or invalid');
	if (!Number.isInteger(decoded.expires)) return res.status(400).end('Expiration date missing or invalid');

	db.User.findById(decoded.uid).then(function (user) {
		if (!user) return res.status(400).end('Unknown user');
		jwt.verify(req.headers.authorization, user.pub, function (err, d) {
			if (err) return res.status(401).end('Error while verifying JWT');
			if (d.expires < Date.now()) return res.status(401).end('Token expired');
			req.jwt = d.data;
			req.jwt.uid = d.uid;
			req.user = user;
			next();
		});
	}).catch(function (ex) {
		return res.status(400).end(ex.message);
	});
}

app.use('/update', authorize);
app.post('/update', upload.array("block"), function (req, res) {
	if(req.jwt.mainBlock) {
		req.user.mainBlock = req.jwt.mainBlock;
		req.user.save();
	}
	//return res.send("end");

	if(req.jwt.blocks) {
		var promises = req.files.map(function (block) {
			return new Promise(function (resolve, reject) {
				if(req.jwt.blocks.indexOf(block.originalname) == -1) return reject('Forged message detected');

				checksum.file(block.path, {algorithm: 'sha256'}, function (err, sum) {
					if (err) return reject('Checksum failed');
					if (sum == block.originalname) {
						return resolve({from: block.path, to: __dirname + "/../blocks/" + block.originalname, sum: sum});

					}
					else return reject('Checksum invalid');
				});
			})
		});
		Promise.all(promises).then(function (mappings) {
			mappings.forEach(function (mapping) {
				mv(mapping.from, mapping.to, function (err) {
					if (err) throw err;
					console.log("Saved block:", mapping.sum);
				});
			});
			return res.send("success");
		}).catch(function (err) {
			return res.status(400).end(err);
		});
	} else return res.send("success");
});

var IP = process.env.IP || "0.0.0.0";
var PORT = process.env.PORT || 3000;

var server = app.listen(PORT, IP, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('App listening at http://%s:%s', host, port);
});
