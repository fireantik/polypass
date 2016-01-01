"use strict";

import React from 'react';
import {api_setUsername} from './../GlobalState.es6';
import PureComponent from 'react-pure-render/component';

export class UsernameSelector extends PureComponent {
	onSubmit(e) {
		e.preventDefault();
		let username = this.refs.username.value;
		api_setUsername(username);
	}

	render() {
		return (
			<form id="username_form" onSubmit={this.onSubmit.bind(this)}>
				<input type="text" placeholder="Username" ref="username" required/>
				<input type="submit"/>
			</form>
		);
	}
}
