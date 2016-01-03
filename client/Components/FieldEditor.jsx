"use strict";

import React from 'react';
import {Panel, Input, ButtonGroup, Button, Row} from 'react-bootstrap';
import {doneEditingField, changeField, deleteField} from '../GlobalState.es6';
import {FieldType} from '../DataTypes/index.es6';
import PureComponent from 'react-pure-render/component';

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export class FieldEditor extends PureComponent {
	handleSubmit(e) {
		e.preventDefault();

		let field = this.props.field.Set({
			name: this.refs.name.getValue(),
			type: this.refs.type.getValue()
		});
		changeField(this.props.recordId, this.props.fieldId, field);

		doneEditingField();
	}

	handleReset(e) {
		e.preventDefault();
		doneEditingField();
	}

	handleDelete() {
		deleteField(this.props.recordId, this.props.fieldId);
		doneEditingField();
	}

	render() {
		let field = this.props.field;
		let types = Object.keys(FieldType).map(x=>FieldType[x]).map(t => <option key={t}
																				 value={t}>{capitalizeFirstLetter(t)}</option>)
		return (
			<Panel header="Edit field">
				<form onSubmit={this.handleSubmit.bind(this)} onReset={this.handleReset.bind(this)}>
					<Input type="text" label="Id" value={this.props.fieldId} disabled/>
					<Input ref="name" type="text" label="Name" defaultValue={field.name}/>
					<Input ref="type" type="select" label="Type" defaultValue={field.type}>
						{types}
					</Input>

					<Button bsStyle="danger" onClick={this.handleDelete.bind(this)}>Delete field</Button>

					<br/><br/>

					<ButtonGroup>
						<Button type="reset">Cancel</Button>
						<Button type="submit" bsStyle="success">Save</Button>
					</ButtonGroup>
				</form>
			</Panel>
		);
	}
}
