var Crypto = require('./crypto.js');
var Compression = require('./compression.js');
var fs = require('fs');

function Block(crypto){
	this.crypto = crypto;
	this.id = null;
	this._iv = null;
	this._tag = null;
	this._raw = null;
	this._lean = null;
	this.debug = 0;
}

Block.prototype.getRaw = function(){
	var self = this;
	
	if(self._raw instanceof Promise){
		return self._raw;
	}
	else if(self._raw instanceof Buffer) {
		return Promise.resolve(self._raw);
	}
	else return this._raw = Compression.compress(self._lean).then(self.crypto.encrypt).then(function(encrypted){
		self._iv = encrypted.iv;
		self._tag = encrypted.tag;
		self._raw = encrypted.data;
		self.debug++;
		return Buffer.concat([encrypted.iv, encrypted.tag, self._raw]);
	});
};

Block.prototype.setRaw = function(raw){
	this._raw = raw.slice(Crypto.ivLength + Crypto.tagLength);
	this._lean = null;
	this._iv = raw.slice(0, Crypto.ivLength);
	this._tag = raw.slice(Crypto.ivLength, Crypto.ivLength + Crypto.tagLength);
};

Block.prototype.getLean = function(){
	var self = this;
	if(this._lean) return Promise.resolve(this._lean);
	else return self.crypto.decrypt(this._raw, this._iv, this._tag).then(Compression.decompress).then(function(lean){
		return self._lean = lean;
	});
};

Block.prototype.setLean = function(lean){
	this._lean = lean;
	this._raw = null;
	this._iv = null;
	this._tag = null;
};

Block.prototype.getInfo = function(){
	var self = this;
	
	return this.getRaw().then(function(raw){
		return new proto.BlockInfo({
			id: self.id,
			iv: self._iv,
			tag: self._tag,
			length: raw.length,
			data: raw
		});
	});
};

module.exports = Block;