'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';

/**
 * @readonly
 * @enum {String}
 */
export const ApiState = Object.freeze({
	askUsername: "USERNAME",
	askRegisterPassword: "REGISTER_PASSWORD",
	askLoginPassword: "LOGIN_PASSWORD",
	passwordInvalid: "PASSWORD_INVALID",
	working: "WORKING",
	ready: "READY"
});

/**
 * @class Api
 * @this Api
 *
 * @property {Number} lastChange
 * @property {?String} username
 * @property {ApiState} state
 * @property {?Crypto} crypto
 * @property {?String} publicKey
 * @property {?String} privateKey
 * @property {?Buffer} salt
 * @property {?Number} uid
 */
export class Api extends MakeClass({
	username: null,
	state: ApiState.askUsername,
	crypto: null,
	publicKey: null,
	privateKey: null,
	salt: null,
	uid: null
}) {
	get cert() {
		return {pub: this.publicKey, priv: this.privateKey};
	}
}
