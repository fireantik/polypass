"use strict";

import React from 'react';
import Immutable from 'immutable';
//import {Modal, Button, Input, ButtonInput} from 'react-bootstrap';
import {Button, Input, ButtonInput} from 'react-bootstrap';
import Crypto from './../../common/Crypto.js';
import Modal from 'react-modal';


const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		width: '600px',
		height: '90%'
	}
};


export class PasswordGenerator extends React.Component {
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
		this.props.onValue(this.recalculate(false));
		this.setState({visible: false});
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
			<Modal style={customStyles} isOpen={this.props.visible} onRequestClose={this.props.onClose}>
				<form onSubmit={this.generate.bind(this)}>
					<h1>Password generator</h1>
					<h4>Key space</h4>
					{checkBoxes}
					<Input ref="len" type="number" label="Length" defaultValue="16"
						   onChange={this.recalculate.bind(this, true)}/>
					{sample}
					<ButtonInput type="submit" value="Generate"/>
				</form>
			</Modal>
		);
	}
}
