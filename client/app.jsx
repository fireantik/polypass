"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/App.jsx';
import {emitter, setInitialState, setTestState} from './GlobalState.es6';

emitter.on('new state', function(state) {
	ReactDOM.render(
		<App state={state}/>,
		document.getElementById('appContainer')
	);
});

if(window.location.hash == "#test") setTestState();
else setInitialState();
