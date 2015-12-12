"use strict";

import React from 'react';
import Immutable from 'immutable';

class RecordSelectorItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div className="custom-list-group-item" onClick={this.props.selected}>
                <button className="scale">{this.props.record.get('name')}</button>
                <button><i className="fa fa-files-o"/></button>
            </div>
        );
    }
}

export class RecordSelector extends React.Component {
    render() {
		let activeRecords = this.props.currentTag ? this.props.records.filter(val => val.get('tags').contains(this.props.currentTag)) : this.props.records;

        let records = activeRecords
			.sortBy(val => val.get('name').toLowerCase())
			.map((record, key) => <RecordSelectorItem key={key} record={record} selected={this.props.selected.bind(null, key)}  />)
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
