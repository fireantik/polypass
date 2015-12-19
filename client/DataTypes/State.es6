'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';


/**
 * @readonly
 * @enum {String}
 */
export const EditingType = Object.freeze({
	record: "RECORD",
	tag: "TAG"
});


/**
 * @class State
 * @this State
 *
 * @property {Number} lastChange
 * @property {String} username
 * @property {?String} currentRecord
 * @property {?String} currentTag
 * @property {Boolean} unsavedChanges
 * @property {EditingType} editingType
 */
export class State extends MakeClass({
	username: "",
	api: null,
	currentRecord: null,
	currentTag: null,
	unsavedChanges: false,
	editingType: EditingType.record
}) {
}
