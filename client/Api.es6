'use strict';
var Block = require('./Block.js');
var Crypto = require('./../common/Crypto.js');
var request = require('superagent');
var jwt = require('jsonwebtoken');
var NodeRSA = require('node-rsa');
var streamBuffers = require('stream-buffers');

export function genKey() {
	var key = new NodeRSA({b: 1024});
	return {
		priv: key.exportKey('pkcs1-private-pem'),
		pub: key.exportKey('pkcs1-public-pem')
	}
}

export function encryptPriv(crypto, string) {
	var block = new Block(crypto);
	block.setLean(new Buffer(string));
	return block.getRaw().then(function (raw) {
		return raw.toString('base64')
	});
}

export function decryptPriv(crypto, string) {
	var block = new Block(crypto);
	block.setRaw(new Buffer(string, 'base64'));
	return block.getLean().then(function (raw) {
		return raw.toString('utf-8')
	});
}

export function jwtSign(uid, cert, data) {
	return new Promise(function (resolve) {
		return jwt.sign({
			uid: uid,
			data: data,
			expires: Date.now() + 60 * 1000
		}, cert, {algorithm: 'RS512'}, resolve);
	});
}

export function register(username, crypto, keys) {
	return encryptPriv(crypto, keys.priv).then(function (priv) {
		return new Promise(function (resolve, reject) {
			request
				.post(location.origin + "/register")
				.type('form')
				.send({
					username: Crypto.quickHash(username).toString('hex'),
					pub: keys.pub,
					priv: priv,
					salt: crypto.salt.toString('hex')
				})
				.end(function (err, resp) {
					if (err) return reject(err);
					resolve(resp.body);
				});
		});
	})
}

export function putBlock(uid, bid, block, cert) {
	var raw;
	return block.getRaw().then(function (r) {
		raw = r;
		//console.log(raw);
		//console.log(raw.toString('hex'));
		var checkSum = Crypto.checkSum(raw);

		return jwtSign(uid, cert, {bid: bid, checksum: checkSum.toString('hex')});
	}).then(function (jwt) {
		return new Promise(function (resolve, reject) {
			request
				.put(location.origin + "/block")
				.set('authorization', jwt)
				.set('Content-Type', 'application/octet-stream')
				.set('Content-Disposition', 'attachment; filename=data')
				.send(raw)
				.end(function (err, resp) {
					if (err) return reject(err);
					resolve(resp.body);
				});
		});
	});
}

export function readBlock(uid, bid, cert) {
	return jwtSign(uid, cert, {bid: bid}).then(function (jwt) {
		return new Promise(function (resolve, reject) {
			var stream = new streamBuffers.WritableStreamBuffer();

			request
				.get(location.origin + "/block")
				.set('authorization', jwt)
				.end(function (err, resp) {
					if (err) return reject(err);
					stream.end();
					resolve(new Buffer(resp.text, 'base64'));
				})
		});
	})
}

export function getInfo(username) {
	return new Promise(function (resolve, reject) {
		request
			.get(location.origin + "/info/" + Crypto.quickHash(username).toString('hex'))
			.end(function (err, resp) {
				if (err) return reject(err);
				return resolve(resp.body);
			})
	});
}

export class Api {
	constructor(username, obj) {
		var self = this;

		this.username = username;

		getInfo(username).then(function (info) {
			if (info.error) return obj.shouldRegister();

			function tryPw() {
				return obj.getPassword().then(function (pw) {
					return new Crypto(pw, new Buffer(info.salt, 'hex')).init;
				}).then(function (crypto) {
					self.crypto = crypto;
					return decryptPriv(crypto, info.priv);
				}).then(function (priv) {
					//console.log(obj.initialized);
					self.keys = {pub: info.pub, priv: priv};
					self.uid = info.uid;
					obj.initialized();
				}).catch(function (err) {
					if (err.message == "Unsupported state or unable to authenticate data") {
						if (typeof obj.invalidPassword == "function") {
							obj.invalidPassword();
							return tryPw();
						}
					}
					else {
						console.log(err);
						console.log(err.message);
						throw err;
					}
				});
			}

			return tryPw();
		}).then(function (should) {
			if (should) {
				return obj.getPassword().then(pw => new Crypto(pw).init).then(crypto => {
					self.crypto = crypto;
					self.keys = genKey();
					return register(username, crypto, self.keys).then(data=>self.uid = data.uid).then(obj.initialized);
				});
			}
		})
	}

	getBlock(id) {
		var block = new Block(this.crypto);
		return readBlock(this.uid, id, this.keys.priv).then(data=> {
			block.setRaw(data);
			return block.getLean();
		});
	}

	writeBlock(id, data) {
		//console.log(this.uid);
		var block = new Block(this.crypto);
		block.setLean(data);
		return putBlock(this.uid, id, block, this.keys.priv);
	}
}
