'use strict';

import Immutable from 'immutable';
import {MasterStateData} from './index.es6';


/**
 * @class MasterState
 * @this MasterState
 *
 * @property {Number} lastChange
 * @property {State} state
 * @property {MasterStateData} data
 */
export class MasterState extends Immutable.Record({
	lastChange: Date.now(),
	state: new State(),
	data: new MasterStateData()
}, "MasterState") {

	/**
	 * @param {String} key
	 * @param {*} value
	 * @returns {MasterState}
	 */
	set(key, value){
		return super.set('lastChange', Date.now()).set(key, value);
	}

	/**
	 * @returns {Date}
	 */
	get changeDate(){
		return new Date(this.lastChange);
	}
}
