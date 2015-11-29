"use strict";

import React from 'react';
import Immutable from 'immutable';

class RecordSelectorItem extends React.Component {
    shouldComponentUpdate(props){
        return this.props.record != props.record;
    }

    render(){
        return (
            <div onClick={this.props.selected}>{this.props.record.get('name')}</div>
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
            <div>
                {records}
            </div>
        )
    }
}