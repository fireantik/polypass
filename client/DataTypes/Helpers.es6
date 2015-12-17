"use strict";

import Immutable from 'immutable';

export function MakeClass(args){
	args['lastChange'] = Date.now();
	var x = Immutable.Record(args);

	x.prototype.Set = function(changes){
		return this.withMutations(item => {
			item.set('lastChange', Date.now());
			for(let key in changes){
				item.set(key, changes[key]);
			}
		});
	};

	return x;
}
