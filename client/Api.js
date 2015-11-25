'use strict';
var Block = require('./Block.js');
var Crypto = require('./../common/Crypto.js');
var rp = require('request-promise');
var jwt = require('jsonwebtoken');
var NodeRSA = require('node-rsa');

function genKey(){
    var key = new NodeRSA({b: 1024});
    return {
        priv: key.exportKey('pkcs1-private-pem'),
        pub: key.exportKey('pkcs1-public-pem')
    }
}

function encryptPriv(crypto, string){
    var block = new Block(crypto);
    block.setLean(new Buffer(string));
    return block.getRaw().then(function(raw){return raw.toString('base64')});
}

function decryptPriv(crypto, string){
    var block = new Block(crypto);
    block.setRaw(new Buffer(string, 'base64'));
    return block.getLean().then(function(raw){return raw.toString('utf-8')});
}

function jwtSign(uid, cert, data){
    return new Promise(function(resolve){
        return jwt.sign({
            uid: uid,
            data: data,
            expires: Date.now() + 60 * 1000
        }, cert, { algorithm: 'RS512'}, resolve);
    });
}

function register(username, crypto, keys){
    return encryptPriv(crypto, keys.priv).then(function(priv){
        return rp({
            uri: location.origin + "/register",
            json: true,
            method: 'POST',
            form: {
                username: Crypto.quickHash(username).toString('hex'),
                pub: keys.pub,
                priv: priv,
                salt: crypto.getSalt().toString('hex')
            }
        })
    })
}

function putBlock(uid, bid, block, cert){
    var raw;
    return block.getRaw().then(function(r){
        raw = r;
        var checkSum = Crypto.checkSum(raw);

        return jwtSign(uid, cert, {bid: bid, checksum: checkSum.toString('hex')});
    }).then(function(jwt){
        return rp({
            uri: location.origin + "/block",
            method: 'PUT',
            body: raw,
            headers: {
                Authorization: jwt
            }
        })
    });
}

function readBlock(uid, bid, cert){
    return jwtSign(uid, cert, {bid: bid}).then(function(jwt){
        return rp({
            uri: location.origin + "/block",
            method: 'GET',
            headers: {
                Authorization: jwt
            },
            encoding: null
        });
    })
}

function getInfo(username){
    return rp({
        uri: location.origin + "/info/" + Crypto.quickHash(username).toString('hex'),
        json: true
    });
}

export class Api {
    constructor(username, obj){
        var self = this;

        this.username = username;

        getInfo(username).then(function(info){
            function tryPw(){
                return obj.getPassword().then(function(pw){
                    return Crypto(pw, new Buffer(info.salt, 'hex'));
                }).then(function(crypto){
                    self.crypto = crypto;
                    return decryptPriv(crypto, info.priv);
                }).then(function(priv){
                    self.keys = {pub: info.pub, priv: priv};
                    self.uid = info.uid;
                    obj.initialized();
                }).catch(function(err){
                    console.log(err);
                    throw err;
                    //return tryPw();
                });
            }

            return tryPw();
        }).catch(function(err){
            if(err.error == "Username not found") return obj.shouldRegister();
            else throw err;
        }).then(function(should){
            if(should) {
                return obj.getPassword().then(pw => Crypto(pw)).then(crypto => {
                    self.crypto = crypto;
                    self.keys = genKey();
                    return register(username, crypto, self.keys).then(data=>self.uid = data.uid).then(obj.initialized);
                });
            }
        })
    }

    getBlock(id){
        var block = new Block(this.crypto);
        return readBlock(this.uid, id, this.keys.priv).then(data=>{
            block.setRaw(data);
            return block.getLean();
        });
    }

    writeBlock(id, data){
        console.log(this.uid);
        var block = new Block(this.crypto);
        block.setLean(data);
        return putBlock(this.uid, id, block, this.keys.priv);
    }
}