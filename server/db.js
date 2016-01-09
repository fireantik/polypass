"use strict";

var Sequelize = require('sequelize');

var dbUrl = process.env.POSTGRESQL || 'sqlite://db.sqlite';

var sequelize = new Sequelize(dbUrl);
var Crypto = require('./../common/Crypto.js');
var production = process.env.NODE_ENV == "prod" || process.env.NODE_ENV == "production";

var maxBlockSize = 25 * 1024 * 1024;

module.exports = {};

var User = module.exports.User = sequelize.define('User', {
	uid: {type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true},
	name: {type: Sequelize.CHAR(Crypto.quickHashLength * 2), allowNull: false, unique: true},
	mainBlock: {type: Sequelize.CHAR(Crypto.quickHashLength * 2), allowNull: true},
	salt: {type: Sequelize.CHAR(Crypto.saltLength * 2), allowNull: false},
	pub: {type: Sequelize.STRING(300), allowNull: false},
	priv: {type: Sequelize.STRING(1000), allowNull: false},
	lastAccess: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW}
}, {timestamps: false});

var Block = module.exports.Block = sequelize.define('Block', {
	hash: {type: Sequelize.CHAR(Crypto.quickHashLength * 2), allowNull: false, primaryKey: true},
	uid: {type: Sequelize.INTEGER, allowNull: false}
}, {timestamps: false});

User.hasMany(Block, {foreignKey: 'uid'});

module.exports.ready = sequelize.sync({force: !production}).then(function () {
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
