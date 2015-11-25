var zlib = require('zlib');

function compress(buffer){
	return new Promise(function(resolve, reject){
		zlib.deflate(buffer, function(err, result) {
			if(err) return reject(err);
			else return resolve(result);
		});
	});
}

function decompress(buffer){
	return new Promise(function(resolve, reject){
		zlib.inflate(buffer, function(err, result) {
			if(err) return reject(err);
			return resolve(result);
		});
	});
}

module.exports = {
	compress: compress,
	decompress: decompress
}

/*var buf = new Buffer("fireant is the boss and is so awesome");

compress(buf).then(function(compressed){
	return decompress(compressed);
}).then(function(data){
	console.log(data.toString('utf-8'));
});*/
