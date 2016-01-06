"use strict";

import React from 'react';
import {Main} from './Main.jsx';
import {RegisterForm, LoginForm, UsernameSelector, ShouldRegisterForm, LoginRegister} from './LoginRegister.jsx';
import PureComponent from 'react-pure-render/component';
import {ApiState} from './../DataTypes/index.es6';

export class App extends PureComponent {
	render() {
		if(this.props.state.api.state == ApiState.ready) {
			return <Main
				data={this.props.state.data}
				state={this.props.state.state}
			/>;
		}
		else return <LoginRegister api={this.props.state.api} />;

		/*if (this.props.state.api.state == ApiState.askUsername) return <UsernameSelector />;
		else if (this.props.state.api.state == ApiState.askLoginPassword) return <LoginForm />;
		else if (this.props.state.api.state == ApiState.passwordInvalid) return <LoginForm invalid/>;
		else if (this.props.state.api.state == ApiState.askRegisterPassword) return <RegisterForm />;
		else if (this.props.state.api.state == ApiState.ready) return <Main data={this.props.state.data}
																			state={this.props.state.state}/>;
		else return <h1>Working</h1>*/
	}
}
