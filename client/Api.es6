'use strict';
var Block = require('./Block.js');
var Crypto = require('./../common/Crypto.js');
var request = require('superagent');
var jwt = require('jsonwebtoken');
var NodeRSA = require('node-rsa');
var $ = require('jquery');

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

export function putBlocks(uid, blocks, cert) {
	var fd = new FormData();


	return Promise.all( blocks.map(b => {
		return b.getRawHash()
	}) ).then(function (rawHashes) {
		var mainBlock = null;
		var files = [];

		rawHashes.forEach(({raw, hash}) => {
			var file = new File([raw.buffer], hash);
			console.log("Uploading block", hash);

			fd.append('block', file);
			files.push(hash);
			if(!mainBlock) mainBlock = hash;
		});

		return jwtSign(uid, cert, {blocks: files, mainBlock: mainBlock});
	}).then(function (jwt) {
		return new Promise(function (resolve, reject) {
			return $.ajax({
				url: '/update',
				data: fd,
				processData: false,
				contentType: false,
				type: 'POST',
				beforeSend: function (request)
				{
					request.setRequestHeader("authorization", jwt);
				}
			}).done(resolve).fail(reject);
		});
	});
}

export function readBlock(uid, hash, cert) {
	return jwtSign(uid, cert, {hash: hash}).then(function (jwt) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/blocks/" + hash, true);
			xhr.responseType = "arraybuffer";
			xhr.setRequestHeader("authentication", jwt);

			xhr.onload = function(e) {
				if(xhr.status != 200) return reject(xhr.response);

				var buffer = new Buffer(xhr.response);
				resolve(buffer);
			};

			xhr.send();
		});
	})
}

export function getInfo(username) {
	let hash = Crypto.quickHash(username).toString('hex');
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/info/" + hash, true);
		xhr.responseType = "json";

		xhr.onload = function(e) {
			if(xhr.status != 200) return reject(xhr.response);
			resolve(xhr.response);
		};

		xhr.send();
	});
}
