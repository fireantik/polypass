"use strict";

import React from 'react';
import {Panel, Input, ButtonGroup, Button} from 'react-bootstrap';
import {doneEditingField, changeField} from '../GlobalState.es6';

export class FieldEditor extends React.Component {
	handleSubmit(e){
		e.preventDefault();

		let field = this.props.field.Set({
			name: this.refs.name.getValue(),
			type: this.refs.type.getValue()
		});
		changeField(this.props.recordId, this.props.fieldId, field);

		doneEditingField();
	}

	handleReset(e){
		e.preventDefault();
		doneEditingField();
	}

	render() {
		let field = this.props.field;
		return (
			<div id="record-tab" className="tab">
				<Panel header="Edit field">
					<form onSubmit={this.handleSubmit.bind(this)} onReset={this.handleReset.bind(this)}>
						<Input type="text" label="Id" value={this.props.fieldId} disabled/>
						<Input ref="name" type="text" label="Name" defaultValue={field.name}/>
						<Input ref="type" type="select" label="Type" defaultValue={field.type}>
							<option value="text">Text</option>
							<option value="password">Password</option>
						</Input>
						<ButtonGroup>
							<Button type="reset">Cancel</Button>
							<Button type="submit" bsStyle="success">Save</Button>
						</ButtonGroup>
					</form>
				</Panel>
			</div>
		);
	}
}
