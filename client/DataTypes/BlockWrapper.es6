'use strict';

import Immutable from 'immutable';
import {MakeClass} from './Helpers.es6';

/**
 * @class FileField
 * @this FileField
 *
 * @property {Number} lastChange
 * @property {Block} block
 * @property {Boolean} uploaded
 */
export class BlockWrapper extends MakeClass({
	block: null,
	uploaded: true
}) {
}
