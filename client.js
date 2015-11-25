"use strict";
var Block = require('./BlockManager.js');
var Crypto = require('./crypto.js');
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
            data: data
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
        
        return jwtSign(uid, cert, {bid: bid, checkSum: checkSum});
    }).then(function(jwt){
        return rp({
            uri: location.origin + "/block",
            method: 'PUT',
            body: raw.toString('base64'),
            headers: {
                Authorization: jwt
            }
        })
    });
}

function getInfo(username){
    return rp({
        uri: location.origin + "/info/" + Crypto.quickHash(username).toString('hex'),
        json: true
    });
}

var keys = genKey();
var crypto, info;
Crypto("is da boss").then(function(c){
    crypto = c;
    return register("fireant", crypto, keys);
}).then(function(data) {
    console.log("register data:", data);
    return getInfo("fireant");
}).catch(function(err){
    console.log(err);
    return getInfo("fireant");
}).then(function(i){
    info = i;
    console.log("info", info);
    return Crypto("is da boss", new Buffer(info.salt, 'hex'));
}).then(function(cr){
    crypto = cr;
    return decryptPriv(crypto, info.priv);
}).then(function(priv){
    keys = {pub: info.pub, priv: priv};
    console.log(keys);
    var block = new Block(crypto);
    block.setLean(new Buffer("fireant is da boss"));
    return putBlock(info.uid, 0, block, keys.priv);
}).then(function(data){
    console.log(data);
})
.catch(function (err){
    throw err;
});
