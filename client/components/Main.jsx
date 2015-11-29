"use strict";

import React from 'react';
import Immutable from 'immutable';
import {TagSelector} from './TagSelector.jsx';
import {RecordSelector} from './RecordSelector.jsx';
import {RecordEditor} from './RecordEditor.jsx';

export class Main extends React.Component {
    constructor(props){
        super(props);
        this.updateRecords(props.data.get('records'));
        this.state = {
            activeRecords: Immutable.Set(this.records.keys()),
            currentRecord: null
        }
    }

    componentWillReceiveProps(props){
        var records = props.data.get('records');
        if(this.props.data.get('records') != records) this.updateRecords(records);
    }

    get tags(){
        return this.props.data.get('tags');
    }

    get activeRecords(){
        return this.state.activeRecords.map(this.records.get.bind(this.records));
    }

    updateRecords(records){
        this.records = records.reduce((prev, next) => prev.set(next.get('id'), next), Immutable.Map());
    }

    filterRecords(ids){
        if (ids.isEmpty()) this.setState({activeRecords: Immutable.Set(this.records.keys())});
        else this.setState({activeRecords: ids});
    }

    recordChanged(id, value){
        this.records = this.records.set(id, value);
        this.lastRecords = this.records.toSet();
        this.props.onUpdate(this.props.data.set('records', this.lastRecords));
    }

    render() {
        var recordEditor = false;

        if(this.state.currentRecord){
            var changeBind = this.recordChanged.bind(this, this.state.currentRecord);
            recordEditor = <RecordEditor key={this.state.currentRecord} record={this.records.get(this.state.currentRecord)} changed={changeBind}/>;
        }

        return (
            <div>
                <TagSelector tags={this.tags} update={this.filterRecords.bind(this)}/>
                <RecordSelector records={this.activeRecords} selected={x=>this.setState({currentRecord: x})}/>
                {recordEditor}
            </div>
        )
    }
}