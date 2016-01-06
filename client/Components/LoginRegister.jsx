"use strict";

import React from 'react';
import {api_setUsername, api_login, api_register} from './../GlobalState.es6';
import PureComponent from 'react-pure-render/component';
import {Grid, Row, Col, ProgressBar, Input, Button, ButtonGroup, Well} from 'react-bootstrap';
import FA from './FontAwesome.jsx';
import {ApiState} from '../DataTypes/index.es6';

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

export class LoginRegister extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			usernameValid: false,
			username: ""
		}
	}

	usernameChanged(e){
		let username = e.target.value;
		let usernameValid = username != "";
		this.setState({usernameValid: usernameValid});

		if(usernameValid) api_setUsername(username);
	}

	handleSubmit(e){
		e.preventDefault();

		let password = this.refs.password.getValue();

		if(this.login) api_login(password);
		else api_register(password);
	}

	get login() {
		return this.state.usernameValid &&
			(this.props.api.state == ApiState.askLoginPassword || this.props.api.state == ApiState.passwordInvalid);
	}

	get register() {
		return this.state.usernameValid && this.props.api.state == ApiState.askRegisterPassword;
	}

	render(){
		let pbLabel;
		let pbPercent;
		let passwordInvalid = this.props.api.state == ApiState.passwordInvalid;

		switch (this.props.api.state){
			case ApiState.retrievingUsername:
				pbLabel = "Checking username";
				pbPercent = 50;
				break;
			case ApiState.hashing:
				pbLabel = "Hashing password";
				pbPercent = 25;
				break;
			case ApiState.downloadingMain:
				pbLabel = "Downloading main block";
				pbPercent = 75;
				break;
			case ApiState.registering:
				pbLabel = "Registering";
				pbPercent = 75;
				break;
			case ApiState.working:
				pbLabel = "Working";
				pbPercent = 50;
				break;
			default:
				pbLabel = "";
				pbPercent = 100;
		}

		return (
			<Grid>
				<Col sm={12}>
					<br/><br/>
					<Well>
						<form className="form-horizontal" onSubmit={this.handleSubmit.bind(this)}>
							<Input
								ref="username"
								type="text"
								label="Username"
								labelClassName="col-sm-2"
								wrapperClassName="col-sm-10"
								onChange={this.usernameChanged.bind(this)}
							/>
							<Input
								ref="password"
								type="password"
								label={passwordInvalid ? "Password (incorrect)" : "Password"}
								labelClassName="col-sm-2"
								wrapperClassName="col-sm-10"
								bsStyle={passwordInvalid ? "error" : undefined}
								hasFeedback={passwordInvalid ? true : undefined}
							/>
							<div style={{opacity: (pbPercent > 0 && pbPercent < 100) + 0}} id="login-progress-bar">
								<ProgressBar bsStyle="info" now={pbPercent} label={pbLabel}/>
							</div>
							<ButtonGroup vertical block>
								<Button
									type={this.login ? "submit" : "button"}
									bsStyle={this.login ? "primary" : "default"}
									disabled={!this.login}>Login
								</Button>
								<Button
									type={this.register ? "submit" : "button"}
									bsStyle={this.register ? "primary" : "default"}
									disabled={!this.register}>Register
								</Button>
							</ButtonGroup>
						</form>
					</Well>
				</Col>
			</Grid>
		);
	}
}
