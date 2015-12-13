"use strict";

import {MasterState, MasterStateData} from './DataTypes/index.es6';
import EventEmitter from 'events';

var state = null;
export const emitter = new EventEmitter();

export function setState(newState){
	state = newState;
	return emitter.emit("new state", state);
}

export function setInitialState(){
	return setState(new MasterState());
}

export function setData(data){
	return setState(state.set('data', data));
}

export function loadData(jsData){
	return setState(state.set('data', new MasterStateData(jsData)));
}
