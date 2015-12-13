'use strict';

import Immutable from 'immutable';


/**
 * @class State
 * @this State
 *
 * @property {Number} lastChange
 * @property {String} username
 * @property {Api} api
 */
export class State extends Immutable.Record({
	lastChange: Date.now(),
	username: "",
	api: null
}, "State") {

	/**
	 * @param {String} key
	 * @param {*} value
	 * @returns {State}
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
