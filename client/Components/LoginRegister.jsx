"use strict";

import React from 'react';
import {api_setUsername, api_login, api_register} from './../GlobalState.es6';
import PureComponent from 'react-pure-render/component';

export class ShouldRegisterForm extends PureComponent {
	render() {
		return (
			<div>
				<h2>Username not found, register?</h2>
				<button onClick={this.props.callback.bind(null, true)}>Yes</button>
				<button onClick={this.props.callback.bind(null, false)}>No</button>
			</div>
		)
	}
}

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

export class PasswordSelector extends PureComponent {
	onSubmit(e) {
		e.preventDefault();
		var password = this.refs.password.value;
		this.props.callback(password);
	}

	render() {
		return (
			<form id="password_form" onSubmit={this.onSubmit.bind(this)}>
				<input type="password" placeholder="Password" ref="password" required/>
				<input type="submit"/>
			</form>
		);
	}
}

export class RegisterForm extends PureComponent {
	render() {
		return (
			<div>
				<h4>Register new user</h4>
				<PasswordSelector callback={api_register}/>
			</div>
		);
	}
}

export class LoginForm extends PureComponent {
	render() {
		let message = this.props.invalid ? <p>Password invalid</p> : false;

		return (
			<div>
				<h4>Login</h4>
				{message}
				<PasswordSelector callback={api_login}/>
			</div>
		);
	}
}
