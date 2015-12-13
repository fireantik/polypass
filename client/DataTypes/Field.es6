'use strict';

import Immutable from 'immutable';


/**
 * @class Field
 * @this Field
 *
 * @property {Number} lastChange
 * @property {String} name
 * @property {String} text
 * @property {String} type
 */
export class Field extends Immutable.Record({
	lastChange: Date.now(),
	name: "",
	text: "",
	type: "text"
}, "Field") {

	/**
	 * @param {Object} [data]
	 */
	constructor(data){
		if(typeof data != "object") return super({});

		var x = {
			lastChange: Date.now(),
			name: "",
			text: "",
			type: "text"
		};

		if(typeof data.lastChange == "number"){
			x.lastChange = data.lastChange;
		}

		if(typeof data.name == "string"){
			x.name = data.name;
		}

		if(typeof data.text == "string"){
			x.text = data.text;
		}

		if(typeof data.type == "string"){
			x.type = data.type;
		}

		super(x);
	}

	/**
	 * @param {String} key
	 * @param {*} value
	 * @returns {Field}
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
