'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';


/**
 * @readonly
 * @enum {String}
 */
export const EditingType = Object.freeze({
	record: "RECORD",
	recordStructure: "RECORD_STRUCTURE",
	tag: "TAG",
	field: "FIELD"
});

/**
 * @readonly
 * @enum {String}
 */
export const ShowType = Object.freeze({
	tags: "TAGS",
	records: "RECORDS",
	editor: "EDITOR"
});


/**
 * @class State
 * @this State
 *
 * @property {Number} lastChange
 * @property {String} username
 * @property {?String} currentRecord
 * @property {?String} currentTag
 * @property {?String} currentField
 * @property {Boolean} unsavedChanges
 * @property {EditingType} editingType
 * @property {ShowType} showType
 */
export class State extends MakeClass({
	username: "",
	currentRecord: null,
	currentTag: null,
	currentField: null,
	unsavedChanges: false,
	editingType: EditingType.record,
	showType: ShowType.editor
}) {
	get urlHash() {
		let map = {
			type: this.editingType,
			showType: this.showType,
			tag: this.currentTag,
			record: this.currentRecord,
			field: this.currentField
		};

		var str = "#";
		var first = true;
		for (var i in map) {
			if (!map[i]) continue;

			if (first) first = false;
			else str += "&";

			str += i + "=" + map[i];
		}

		return str;
	}

	makeShowLink(type) {
		return this.set('showType', type).urlHash;
	}
}
