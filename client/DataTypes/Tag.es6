'use strict';

import Immutable from 'immutable';


/**
 * @class Tag
 * @this Tag
 *
 * @property {Number} lastChange
 * @property {String} name
 */
export class Tag extends Immutable.Record({
	lastChange: Date.now(),
	name: ""
}, "Tag") {

	/**
	 * @param {Object} [data]
	 */
	constructor(data){
		if(typeof data != "object") return super({});

		var x = {
			lastChange: Date.now(),
			name: ""
		};

		if(typeof data.lastChange == "number"){
			x.lastChange = data.lastChange;
		}

		if(typeof data.name == "string"){
			x.name = data.name;
		}

		super(x);
	}

	/**
	 * @param {String} key
	 * @param {*} value
	 * @returns {Tag}
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
