'use strict';

import Immutable from 'immutable';
import {Record} from './Record.es6';
import {Tag} from './Tag.es6';
import {MakeClass} from './Helpers.es6';


/**
 * @class MasterStateData
 * @this MasterStateData
 *
 * @property {Number} lastChange
 * @property {Object.<string, Record>} records
 * @property {Object.<string, Tag>} tags
 */
export class MasterStateData extends MakeClass({
	records: Immutable.Map(),
	tags: Immutable.Map()
}) {

	/**
	 * @param {Object} [data]
	 */
	constructor(data) {
		if (typeof data != "object") return super({});

		var x = {
			lastChange: Date.now(),
			records: {},
			tags: {},
			activeBlocks: []
		};

		if (typeof data.lastChange == "number") {
			x.lastChange = data.lastChange;
		}

		if (typeof data.records == "object") {
			for (let key in data.records) {
				x.records[key] = Record.fromJS(data.records[key]);
			}
		}

		if (typeof data.tags == "object") {
			for (let key in data.tags) {
				x.tags[key] = Tag.fromJS(data.tags[key]);
			}
		}

		x.records = Immutable.Map(x.records);
		x.tags = Immutable.Map(x.tags);

		super(x);
	}
}
