"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './Components/App.jsx';
import {emitter, setInitialState, setTestState, urlChanged} from './GlobalState.es6';
import 'bootstrap/less/bootstrap.less';
import '../style/style.less';

var MyWorker = require("worker?service!./Worker.es6");

var worker = null;

MyWorker({ scope: '/' }).then((registration) => {
	console.info('Service worker registration successful', registration);
	worker = registration.active;
}).catch((err) => {
	console.error('Service worker registration failed:', err);
});

emitter.on('new state', function (state) {
	ReactDOM.render(
		<App state={state}/>,
		document.getElementById('appContainer')
	);
});

emitter.on('blocks changed', function (blocks) {
	console.log("blocks:", blocks);
	if(worker) worker.postMessage({type: 'blocks', blocks: blocks});
});


window.addEventListener('hashchange', urlChanged);

if (window.location.hash == "#test") {
	setTestState();
}
else {
	setInitialState();
}

