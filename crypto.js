var crypto = require('crypto');

module.exports = function Crypto(password, inputSalt){
  function randomBuffer(len){
    return new Promise(function(resolve, reject){
      crypto.randomBytes(len, function(ex, buf) {
        if (ex) return reject(ex);
        resolve(buf);
      });
    });
  }
  
  function makeIV(){
    return randomBuffer(12);
  }
  
  function makeSalt(){
    return randomBuffer(8);
  }
  
  function makeKey(password, salt){
    return new Promise(function(resolve, reject){
      crypto.pbkdf2(password, salt, 10000, 32, 'sha256', function(err, key) {
        if (err) reject(err);
        resolve(key);
      });
    });
  }
  
  function makeSaltKey(password){
    var salt;
    return makeSalt().then(function(s){
      salt = s;
      return makeKey(password, salt);
    }).then(function(key){
      return {key: key, salt: salt};
    });
  }
  
  function encrypt(buffer, key) {
    return makeIV().then(function(iv){
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
  }
  
  function decrypt(data, key, iv, tag) {
    return new Promise(function(resolve, reject){
      var decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(tag);
      var buffers = [];
      buffers.push(decipher.update(data));
      buffers.push(decipher.final());
      
      resolve(Buffer.concat(buffers));
    });
  }
  
  var self = this;
  var info = {
    key: null,
    salt: inputSalt || null
  };
  
  
  function outerEncrypt(data){
    return encrypt(data, info.key);
  }
  
  function outerDecrypt(data, iv, tag){
    return decrypt(data, info.key, iv, tag);
  }
  
  function getSalt(){
    return info.salt;
  }

  var out = {};
  Object.defineProperty(out, 'getSalt', {writable: false, value: getSalt});
  Object.defineProperty(out, 'encrypt', {writable: false, value: outerEncrypt});
  Object.defineProperty(out, 'decrypt', {writable: false, value: outerDecrypt});
  
  var prom;
  if(!info.salt) prom = makeSalt().then(function(s){info.salt = s; return makeKey(password, s)});
  else prom = makeKey(password, info.salt);
  return prom.then(function(key){
    info.key = key;
    return out;
  });
};

function quickHash(what, salt){
  var hash = crypto.createHash('sha256');
  hash.update(what);
  if(salt) hash.update(salt);
  return hash.digest();
}

function checkSum(what){
  return quickHash(what);
}

Object.defineProperty(module.exports, 'saltLength', {writable: false, value: 8});
Object.defineProperty(module.exports, 'quickHashLength', {writable: false, value: 32});
Object.defineProperty(module.exports, 'quickHash', {writable: false, value: quickHash});
Object.defineProperty(module.exports, 'ivLength', {writable: false, value: 12});
Object.defineProperty(module.exports, 'tagLength', {writable: false, value: 16});
Object.defineProperty(module.exports, 'checkSum', {writable: false, value: checkSum});


/*crypto.randomBytes(65536, function(ex, buf) {
  var pw = 'dfgdfgdg';
  var salt, hw;
  
  Crypto(pw).then(function(cr){
    console.log("1");
    salt = cr.getSalt();
    console.log(cr);
    window.cr = cr;
    return cr.encrypt(buf);
  }).then(function(x){
    console.log("2");
    console.log(x);
    hw = x;
    return Crypto(pw, salt);
  }).then(function(cr){
    console.log("3");
    return cr.decrypt(hw.data, hw.iv, hw.tag);
  }).then(function(output){
    console.log("4");
    console.log(output);
    //console.log(output.toString('utf-8'));
  }, function(err){
    console.log("5");
    console.log(err);
  });

});*/
