"use strict";

import React from 'react';
import {Panel, Input, ButtonGroup, Button} from 'react-bootstrap';
import {doneEditingRecord, setRecord} from '../GlobalState.es6';

export class RecordStructureEditor extends React.Component {
	handleSubmit(e){
		e.preventDefault();

		let record = this.props.record.Set({
			name: this.refs.name.getValue()
		});

		setRecord(this.props.id, record);

		doneEditingRecord();
	}

	handleReset(e){
		e.preventDefault();
		doneEditingRecord();
	}


	render() {
		let record = this.props.record;
		return (
			<div id="record-tab" className="tab">
				<Panel header="Edit record">
					<form onSubmit={this.handleSubmit.bind(this)} onReset={this.handleReset.bind(this)}>
						<Input type="text" label="Id" value={this.props.id} disabled/>
						<Input ref="name" type="text" label="Name" defaultValue={record.name}/>
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
