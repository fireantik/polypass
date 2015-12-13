"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/App.jsx';
import {emitter, setInitialState} from './GlobalState.es6';

emitter.on('new state', function(state) {
	ReactDOM.render(
		<App state={state}/>,
		document.getElementById('appContainer')
	);
});

setInitialState();
