"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './Components/App.jsx';
import {emitter, setInitialState, setTestState, urlChanged} from './GlobalState.es6';
import 'bootstrap/less/bootstrap.less';
import '../style/style.less';

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

