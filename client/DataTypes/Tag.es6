'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';


/**
 * @class Tag
 * @this Tag
 *
 * @property {Number} lastChange
 * @property {String} name
 */
export class Tag extends MakeClass({
	name: ""
}) {

	/**
	 * @param {Object} [data]
	 */
	static fromJS(data) {
		if (typeof data != "object") return new Tag();

		var x = {
			lastChange: Date.now(),
			name: ""
		};

		if (typeof data.lastChange == "number") {
			x.lastChange = data.lastChange;
		}

		if (typeof data.name == "string") {
			x.name = data.name;
		}

		return new Tag(x);
	}
}
