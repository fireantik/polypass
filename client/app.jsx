"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/App.jsx';
import {emitter, setInitialState, setTestState} from './GlobalState.es6';
require('bootstrap/less/bootstrap.less');
require('../style/style.less');
require("font-awesome-webpack");

emitter.on('new state', function(state) {
	ReactDOM.render(
		<App state={state}/>,
		document.getElementById('appContainer')
	);
});

if(window.location.hash == "#test") setTestState();
else setInitialState();
