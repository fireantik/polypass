"use strict";

var Sequelize = require('sequelize');
var sequelize = new Sequelize('sqlite://db.sqlite');
var Crypto = require('./../common/Crypto.js');

var maxBlockSize = 25 * 1024 * 1024;

module.exports = {};

var User = module.exports.User = sequelize.define('User', {
	uid: {type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true},
	name: {type: Sequelize.CHAR(Crypto.quickHashLength * 2), allowNull: false, unique: true},
	salt: {type: Sequelize.CHAR(Crypto.saltLength * 2), allowNull: false},
	pub: {type: Sequelize.STRING(300), allowNull: false},
	priv: {type: Sequelize.STRING(1000), allowNull: false},
	lastAccess: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW}
}, {timestamps: false});

var Block = module.exports.Block = sequelize.define('Block', {
	uid: {type: Sequelize.INTEGER, allowNull: false, primaryKey: true},
	bid: {type: Sequelize.INTEGER, allowNull: false, primaryKey: true},
	data: {type: Sequelize.BLOB, allowNull: false, validate: {len: [0, maxBlockSize]}}
}, {timestamps: false});

User.hasMany(Block, {foreignKey: 'uid'});

module.exports.ready = sequelize.sync({force: true}).then(function () {
	console.log("db synced");
});

module.exports.createUser = function (username, salt, validationHash) {
	console.log(validationHash.length);
	return User.create({
		name: username,
		salt: salt,
		validationHash: validationHash
	});
};
