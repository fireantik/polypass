var Crypto = require('./../common/Crypto.js');
var Compression = require('./Compression.js');

function Block(crypto) {
	this.crypto = crypto;
	this.id = null;
	this._iv = null;
	this._tag = null;
	this._raw = null;
	this._lean = null;
	this.debug = Math.floor(Math.random() * 10000);
}

Block.prototype.getRaw = function () {
	var self = this;
	if (self._raw instanceof Promise) {
		return self._raw;
	}
	else if (self._raw instanceof Buffer) {
		return Promise.resolve(self._raw);
	}
	else return this._raw = Compression.compress(self._lean).then(self.crypto.encrypt.bind(self.crypto)).then(function (encrypted) {
			self._iv = encrypted.iv;
			self._tag = encrypted.tag;
			self.debug++;
			return self._raw = Buffer.concat([encrypted.iv, encrypted.tag, encrypted.data]);
		});
};

Block.prototype.setRaw = function (raw) {
	this._raw = raw.slice(Crypto.ivLength + Crypto.tagLength);
	this._lean = null;
	this._iv = raw.slice(0, Crypto.ivLength);
	this._tag = raw.slice(Crypto.ivLength, Crypto.ivLength + Crypto.tagLength);
};

Block.prototype.getLean = function () {
	var self = this;
	if (this._lean) return Promise.resolve(this._lean);
	else return self.crypto.decrypt(this._raw, this._iv, this._tag).then(Compression.decompress).then(function (lean) {
		return self._lean = lean;
	});
};

Block.prototype.setLean = function (lean) {
	this._lean = lean;
	this._raw = null;
	this._iv = null;
	this._tag = null;
};

Block.prototype.getRawHash = function () {
	var self = this;

	return this.getRaw().then(function (raw) {
		return {
			raw: raw,
			hash: Crypto.checkSum(raw).toString('hex'),
			debug: self.debug
		}
	});
};

module.exports = Block;
