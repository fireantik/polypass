'use strict';

import Immutable from 'immutable';
import {Field} from './index.es6';


/**
 * @class Record
 * @this Record
 *
 * @property {Number} lastChange
 * @property {String} name
 * @property {Array.<String>} tags
 * @property {Object.<string, Field>} fields
 */
export class Record extends Immutable.Record({
	lastChange: Date.now(),
	name: "",
	tags: Immutable.Set(),
	fields: Immutable.Map()
}, "Record") {

	/**
	 * @param {Object} [data]
	 */
	constructor(data){
		if(typeof data != "object") return super({});

		var x = {
			lastChange: Date.now(),
			name: "",
			tags: [],
			fields: {}
		};

		if(typeof data.lastChange == "number"){
			x.lastChange = data.lastChange;
		}

		if(typeof data.tags == "array"){
			for(var val of data.tags){
				if(typeof val == "string"){
					tags.push(val);
				}
			}
		}

		if(typeof data.fields == "object"){
			for(var [key, value] of data.fields){
				x.fields[key] = Field.fromJS(value);
			}
		}

		x.tags = Immutable.Set(x.tags);
		x.fields = Immutable.Map(x.fields);

		super(x);
	}

	/**
	 * @param {String} key
	 * @param {*} value
	 * @returns {Record}
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
