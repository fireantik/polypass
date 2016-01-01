"use strict";

import React from 'react';
import PureComponent from 'react-pure-render/component';
import {setCurrentRecord} from './../GlobalState.es6';
import CopyToClipboard from 'react-copy-to-clipboard';
import {FieldType} from '../DataTypes/index.es6';
import FA from './FontAwesome.jsx';

class RecordSelectorItem extends PureComponent {
	render(){
		let record = this.props.record;

		var cls = "custom-list-group-item" + (this.props.active ? " active" : "");

		var copyBtn = false;

		let pwField = record.fields.find(x=>x.type == FieldType.password);
		if(pwField){
			copyBtn = (
				<CopyToClipboard text={pwField.value}>
					<button><FA icon="files-o"/></button>
				</CopyToClipboard>
			);
		}

		return (
			<div className={cls} onClick={setCurrentRecord.bind(null, this.props.id)}>
				<button className="scale">{record.name}</button>
				{copyBtn}
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

		return (
			<div id="record-list-tab" className="tab">
				<div className="custom-list-group">
					{records}
				</div>
			</div>
		)
	}
}
