"use strict";

import React from 'react';
import PureComponent from 'react-pure-render/component';
import {setCurrentRecord} from './../GlobalState.es6';

class RecordSelectorItem extends PureComponent {
	render(){
		var cls = "custom-list-group-item" + (this.props.active ? " active" : "");

		return (
			<div className={cls} onClick={setCurrentRecord.bind(null, this.props.id)}>
				<button className="scale">{this.props.record.name}</button>
				<button><i className="fa fa-files-o"/></button>
			</div>
		);
	}
}

export class RecordSelector extends PureComponent {
	render(){
		let activeRecords = this.props.currentTag ? this.props.records.filter(val => val.tags.contains(this.props.currentTag)) : this.props.records;

		let records = activeRecords
			.sortBy(val => val.name.toLowerCase())
			.map((record, key) => <RecordSelectorItem active={this.props.currentRecord == key} key={key} id={key} record={record}/>)
			.toArray();

		//TODO implement creating new records
		return (
			<div id="record-list-tab" className="tab">
				<div className="custom-list-group">
					<div className="custom-list-group-item">
						<button className="scale">Create new record</button>
					</div>
					{records}
				</div>
			</div>
		)
	}
}
