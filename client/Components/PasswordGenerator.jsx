"use strict";

import React from 'react';
import Immutable from 'immutable';
//import {Modal, Button, Input, ButtonInput} from 'react-bootstrap';
import {Button, Input, Panel, ButtonGroup} from 'react-bootstrap';
import {passwordGenerated} from '../GlobalState.es6';
import Crypto from './../../common/Crypto.js';
import PureComponent from 'react-pure-render/component';


export class PasswordGenerator extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			visible: true,
			keySpace: [],
			sample: "",
			checkBoxes: Immutable.Map({
				lalpha: Immutable.Map({
					label: "Lowercase alphabetical - [a-z]",
					checked: true,
					keySpace: "qwertyuiopasdfghjklzxcvbnm"
				}),
				ralpha: Immutable.Map({
					label: "Uppercase alphabetical - [A-Z]",
					checked: true,
					keySpace: "QWERTYUIOPASDFGHJKLZXCVBNM"
				}),
				num: Immutable.Map({label: "Numerical - [0-9]", checked: true, keySpace: "0123456789"}),
				special1: Immutable.Map({label: "Spatial characters - [ _-]", checked: true, keySpace: " _-"}),
				special2: Immutable.Map({
					label: "Special characters - [~!@#$%^*()+[]{}:;?|*,.]",
					checked: false,
					keySpace: "~!@#$%^*()+[]{}:;?|*,."
				})
			})
		};
		//this.recalculate(true);
	}

	generate(e) {
		e.preventDefault();
		passwordGenerated(this.props.recordId, this.props.fieldId, this.recalculate(false));
	}

	static generateKey(keySpace, len) {
		var key = "";
		for (var i = 0; i < len; i++) {
			key += keySpace[Crypto.randomInt(0, keySpace.length)];
		}
		return key;
	}

	static calculateEntropy(keySpace, len) {
		return Math.floor(Math.log2(Math.pow(keySpace.length, len)));
	}

	generateInfo() {
		return (
			<p>
				Sample key: {this.state.sample}<br/>
				Password
				entropy: {PasswordGenerator.calculateEntropy(this.state.keySpace, parseInt(this.refs.len.getValue()))}
				bits
			</p>
		);
	}

	recalculate(sample, key) {
		var checkBoxes = this.state.checkBoxes;

		if (typeof key == "string") {
			let checked = this.state.checkBoxes.get(key).get('checked');
			let box = this.state.checkBoxes.get(key).set('checked', !checked);
			this.setState({checkBoxes: checkBoxes = this.state.checkBoxes.set(key, box)});
		}

		var keySpace = [];

		for (var [k, cb] of checkBoxes) {
			if (cb.get('checked')) {
				for (var a of cb.get('keySpace').split('')) keySpace.push(a);
			}
		}

		//let len = 10;
		let len = parseInt(this.refs.len.getValue());
		let pass = keySpace.length != 0 ? PasswordGenerator.generateKey(keySpace, len) : "";

		if (sample) {
			this.setState({
				keySpace: keySpace,
				sample: pass
			});
		}
		else {
			return pass;
		}
	}

	render() {
		var sample = (this.state.sample && this.refs.len) ? this.generateInfo() : false;
		var keyspace = <p>Keyspace: {JSON.stringify(this.state.keySpace)}</p>;

		var checkBoxes = [];
		for (var [key, value] of this.state.checkBoxes) {
			checkBoxes.push(<Input
				key={key}
				ref={key}
				type="checkbox"
				label={value.get('label')}
				onChange={this.recalculate.bind(this, true, key)}
				checked={value.get('checked')}
			/>);
		}

		return (
			<Panel header="Generate password">
				<form onSubmit={this.generate.bind(this)}>
					<h4>Key space</h4>
					{checkBoxes}
					<Input ref="len" type="number" label="Length" defaultValue="16"
						   onChange={this.recalculate.bind(this, true)}/>
					{sample}
					<ButtonGroup>
						<Button type="reset" href={this.props.state.recordHash}>Cancel</Button>
						<Button type="submit" bsStyle="success">Generate</Button>
					</ButtonGroup>
				</form>
			</Panel>
		);
	}
}
