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
 * @property {Number} maxBlockId
 */
export class MasterStateData extends MakeClass({
	records: Immutable.Map(),
	tags: Immutable.Map(),
	maxBlockId: 1
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
			maxBlockId: 1
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

		if (typeof data.maxBlockId == "number") {
			x.maxBlockId = data.maxBlockId;
		}

		x.records = Immutable.Map(x.records);
		x.tags = Immutable.Map(x.tags);

		super(x);
	}
}
