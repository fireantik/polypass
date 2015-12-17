'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';


/**
 * @class State
 * @this State
 *
 * @property {Number} lastChange
 * @property {String} username
 * @property {?String} currentRecord
 * @property {?String} currentTag
 * @property {Boolean} unsavedChanges
 */
export class State extends MakeClass({
	username: "",
	api: null,
	currentRecord: null,
	currentTag: null,
	unsavedChanges: false
}) {
}
