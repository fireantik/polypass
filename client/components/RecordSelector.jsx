"use strict";

import React from 'react';
import Immutable from 'immutable';

class RecordSelectorItem extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(props){
        return this.props.record != props.record;
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
    shouldComponentUpdate(props){
        return this.props.records != props.records;
    }

    render() {
        let records = this.props.records.map(record => {
            return <RecordSelectorItem key={record.get('id')} record={record} selected={this.props.selected.bind(null, record.get('id'))}  />
        });

        return (
            <div id="record-list-tab" className="tab">
                <div className="custom-list-group">
                    {records}
                </div>
            </div>
        )
    }
}