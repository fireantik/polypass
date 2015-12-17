'use strict';

import Immutable from 'immutable';
import {Field} from './Field.es6';
import {MakeClass} from './Helpers.es6';


/**
 * @class Record
 * @this Record
 *
 * @property {Number} lastChange
 * @property {String} name
 * @property {Array.<String>} tags
 * @property {Object.<string, Field>} fields
 */
export class Record extends MakeClass({
	name: "",
	tags: Immutable.Set(),
	fields: Immutable.Map()
}) {

	/**
	 * @param {Object} [data]
	 */
	static fromJS(data){
		if(typeof data != "object") return new Record();

		var x = {
			lastChange: Date.now(),
			name: "",
			tags: [],
			fields: {}
		};

		if(typeof data.lastChange == "number"){
			x.lastChange = data.lastChange;
		}

		if(typeof data.name == "string"){
			x.name = data.name;
		}

		if(Array.isArray(data.tags)){
			for(var val of data.tags){
				if(typeof val == "string"){
					x.tags.push(val);
				}
			}
		}

		if(typeof data.fields == "object"){
			for(var key in data.fields){
				x.fields[key] = Field.fromJS(data.fields[key]);
			}
		}

		x.tags = Immutable.Set(x.tags);
		x.fields = Immutable.Map(x.fields);

		return new Record(x);
	}
}
