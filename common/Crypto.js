"use strict";

var crypto = require('crypto');

var ivLen = 12;
var tagLen = 16;
var saltLen = 8;
var pbkdf2Len = 32;
var pbkdf2Iters = 1000;
var quickHashLen = 32;

function randomBuffer(len) {
	return new Promise(function (resolve, reject) {
		crypto.randomBytes(len, function (ex, buf) {
			if (ex) return reject(ex);
			resolve(buf);
		});
	});
}

function makeIV() {
	return randomBuffer(ivLen);
}

function makeSalt() {
	return randomBuffer(saltLen);
}

function makeKey(password, salt) {
	return new Promise(function (resolve, reject) {
		crypto.pbkdf2(password, salt, pbkdf2Iters, pbkdf2Len, 'sha256', function (err, key) {
			if (err) reject(err);
			resolve(key);
		});
	});
}


var keys = new WeakMap();
var salts = new WeakMap();

function Crypto(password, salt) {
	var self = this;
	var initialized = false;

	var init = (salt ? Promise.resolve(salt) : makeSalt())
		.then(function (s) {
			salts.set(self, salt = s);
			return makeKey(password, salt);
		})
		.then(function (key) {
			keys.set(self, key);
			initialized = true;
			return self;
		});

	Object.defineProperty(this, 'salt', {get: salts.get.bind(salts, self)});
	Object.defineProperty(this, 'init', {value: init});
	Object.defineProperty(this, 'isInitialized', {
		get: function () {
			return initialized;
		}
	});
}

Crypto.prototype.encrypt = function (buffer) {
	var key = keys.get(this);

	return makeIV().then(function (iv) {
		var cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
		var buffers = [];

		buffers.push(cipher.update(buffer));
		buffers.push(cipher.final());

		var output = Buffer.concat(buffers);

		return {
			data: output,
			tag: cipher.getAuthTag(),
			iv: iv
		};
	});
};

Crypto.prototype.decrypt = function (data, iv, tag) {
	var key = keys.get(this);

	return new Promise(function (resolve, reject) {
		var decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
		decipher.setAuthTag(tag);
		var buffers = [];
		buffers.push(decipher.update(data));
		buffers.push(decipher.final());

		resolve(Buffer.concat(buffers));
	});
};

Crypto.quickHash = function (what, salt) {
	var hash = crypto.createHash('sha256');
	hash.update(what);
	if (salt) hash.update(salt);
	return hash.digest();
};

Crypto.checkSum = Crypto.quickHash;
Crypto.saltLength = saltLen;
Crypto.quickHashLength = quickHashLen;
Crypto.ivLength = ivLen;
Crypto.tagLength = tagLen;

Crypto.randomInt = function (from, to) {
	var buf = crypto.randomBytes(4);
	var num = buf.reduce(function (prev, next) {
		return prev + next
	}, 0);
	return num % (to - from) + from;
};


Crypto.randomHex = function (len) {
	return crypto.randomBytes(len / 2).toString('hex').substring(0, len);
};

Crypto.randomId = function () {
	return Crypto.randomHex(16);
};

module.exports = Object.freeze(Crypto);
