'use strict';

import Immutable from 'immutable';
import {MasterStateData} from './MasterStateData.es6';
import {State} from './State.es6';
import {Api} from './Api.es6';
import {MakeClass} from './Helpers.es6';


/**
 * @class MasterState
 * @this MasterState
 *
 * @property {Number} lastChange
 * @property {State} state
 * @property {MasterStateData} data
 * @property {Boolean} test
 * @property {Api} api
 * @property {Object.<number, Block>} blocks
 * @property {Object.<String>} activeBlocks
 */
export class MasterState extends MakeClass({
	state: new State(),
	data: new MasterStateData(),
	api: new Api(),
	test: false,
	blocks: Immutable.Map(),
	activeBlocks: Immutable.Set()
}) {
}
