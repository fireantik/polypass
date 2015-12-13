'use strict';

import Immutable from 'immutable';
import {Record, Tag} from './index.es6';


/**
 * @class MasterStateData
 * @this MasterStateData
 *
 * @property {Number} lastChange
 * @property {Object.<string, Record>} records
 * @property {Object.<string, Tag>} tags
 */
export class MasterStateData extends Immutable.Record({
	lastChange: Date.now(),
	records: Immutable.Map(),
	tags: Immutable.Map()
}, "MasterState") {

	/**
	 * @param {Object} [data]
	 */
	constructor(data){
		if(typeof data != "object") return super({});

		var x = {
			lastChange: Date.now(),
			records: {},
			tags: {}
		};

		if(typeof data.lastChange == "number"){
			x.lastChange = data.lastChange;
		}

		if(typeof data.records == "object"){
			for(var [key, value] of data.records){
				x.records[key] = Record.fromJS(value);
			}
		}

		if(typeof data.tags == "object"){
			for(var [key, value] of data.tags){
				x.tags[key] = Tag.fromJS(value);
			}
		}

		x.records = Immutable.Map(x.records);
		x.tags = Immutable.Map(x.tags);

		super(x);
	}

	/**
	 * @param {String} key
	 * @param {*} value
	 * @returns {MasterStateData}
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
