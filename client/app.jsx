"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from 'Components/App.jsx';
import {emitter, setInitialState, setTestState, urlChanged} from './GlobalState.es6';
require('bootstrap/less/bootstrap.less');
require('../style/style.less');

emitter.on('new state', function (state) {
	ReactDOM.render(
		<App state={state}/>,
		document.getElementById('appContainer')
	);
});


window.addEventListener('hashchange', urlChanged);

if (window.location.hash == "#test") {
	setTestState();
}
else {
	setInitialState();
}

