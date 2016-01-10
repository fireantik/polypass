"use strict";

import URI from 'urijs';

let BlockCache = "BLOCKCACHE";
let InfoCache = "INFOCACHE";

var currentBlocks = [];

addEventListener('install', event => {
	//console.log("install", event);

	let prom = caches
	.open(BlockCache)
	.then(cache => {
		console.log('Opened cache');
		return cache.keys();
	})
	.then(keys => currentBlocks = keys);

	return event.waitUntil(prom);
});

addEventListener('activate', event => {
	//console.log("activate", event);
});

addEventListener('message', event => {
	//console.log("message", event);

	if(event.data.type == "blocks"){
		let blocks = event.data.blocks;

		let added = blocks.filter(b => currentBlocks.indexOf(b) == -1);
		let removed = currentBlocks.filter(b => blocks.indexOf(b) == -1);

		console.info("Updating block cache. Removing:", removed, "Adding:", added);

		caches
		.open(BlockCache)
		.then(cache => {
			let a = removed.forEach(r => cache.delete(`/blocks/${r}`));
			let b = added.forEach(r => cache.add(`/blocks/${r}`));

			currentBlocks = event.data.blocks;
			return Promise.all([a,b]);
		});

	}
});

addEventListener('fetch', event => {
	//console.log("fetch", event);

	let uri = URI(event.request.url);
	let path = uri.path();

	if(/^\/info/.test(path)){
		let online = event.currentTarget.navigator.onLine;
		let prom = (online ? fetch(event.request) : Promise.reject())
		.then(resp => {
			return caches
			.open(InfoCache)
			.then(cache => {
				return cache.put(event.request, resp.clone());
			})
			.then(_ => resp);
		})
		.catch(() => {
			return caches.match(event.request)
		});

		event.respondWith(prom);
	}

	if(/^\/blocks/.test(path)) {
		event.respondWith(
			caches.match(event.request).then(function (response) {
				return response || fetch(event.request);
			})
		);
	}
});


