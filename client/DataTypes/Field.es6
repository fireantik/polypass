'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';


/**
 * @readonly
 * @enum {String}
 */
export const FieldType = Object.freeze({
	text: "TEXT",
	password: "PASSWORD",
	email: "EMAIL",
	url: "URL",
	file: "FILE"
});

/**
 * @class Field
 * @this Field
 *
 * @property {Number} lastChange
 * @property {String} name
 * @property {*} value
 * @property {FieldType} type
 */
export class Field extends MakeClass({
	name: "",
	type: "text",
	value: ""
}) {
	constructor(props) {
		super(props);
	}

	/**
	 * @param {Object} [data]
	 * @return {Field}
	 */
	static fromJS(data) {
		if (typeof data != "object") return new Field();

		var x = {
			lastChange: Date.now(),
			name: "",
			type: "text",
			value: ""
		};

		if (typeof data.lastChange == "number") {
			x.lastChange = data.lastChange;
		}

		if (typeof data.name == "string") {
			x.name = data.name;
		}

		if (typeof data.type == "string") {
			x.type = data.type;
		}

		if (typeof data.value == "string") {
			x.value = data.value;
		}

		if (data.type == FieldType.file) {
			x.value = FileField.fromJS(data.value);
		}

		return new Field(x);
	}
}

/**
 * @class FileField
 * @this FileField
 *
 * @property {Number} lastChange
 * @property {String} fileName
 * @property {Number} fileSize
 * @property {?String} hash
 */
export class FileField extends MakeClass({
	fileName: "",
	fileSize: 0,
	hash: null
}) {
	constructor(props) {
		super(props);
	}

	/**
	 * @param {Object} [data]
	 * @return {FileField}
	 */
	static fromJS(data) {
		if(typeof data == "object") return new FileField(data);
		else return new FileField();
	}
}

