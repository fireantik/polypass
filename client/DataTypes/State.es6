'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';


/**
 * @readonly
 * @enum {String}
 */
export const EditingType = Object.freeze({
	record: "RECORD",
	tag: "TAG",
	field: "FIELD"
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
 */
export class State extends MakeClass({
	username: "",
	currentRecord: null,
	currentTag: null,
	currentField: null,
	unsavedChanges: false,
	editingType: EditingType.record
}) {
}
