"use strict";

import React from 'react';
import Immutable from 'immutable';
import {TagSelector} from './TagSelector.jsx';
import {RecordSelector} from './RecordSelector.jsx';
import {RecordEditor} from './RecordEditor.jsx';

import { Navbar, Nav, NavItem, NavDropdown } from 'react-bootstrap';

export class Header extends React.Component {
    render() {
        return (
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">PolyPass</a>
                    </Navbar.Brand>
                </Navbar.Header>
            </Navbar>
        );
    }
}

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

	getTagsFor(id){
		return this.tags.filter(t=>t.get('records').contains(id));
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
        this.props.onUpdate(this.props.data.set('records', this.records.toSet()));
    }

	setTags(tags){
		console.log("setting tags to", tags.toJS());
		let newData = this.props.data.set('tags', tags);
		this.props.onUpdate(newData);
	}

    render() {
        var recordEditor = false;

        if(this.state.currentRecord){
            var changeBind = this.recordChanged.bind(this, this.state.currentRecord);
            recordEditor = <RecordEditor tags={this.tags} setTags={this.setTags.bind(this)} getTags={this.getTagsFor.bind(this)} key={this.state.currentRecord} record={this.records.get(this.state.currentRecord)} changed={changeBind}/>;
        }

        return (
            <div id="app">
                <Header id="header"/>
                <div id="tabs">
                    <TagSelector tags={this.tags} update={this.filterRecords.bind(this)}/>
                    <RecordSelector records={this.activeRecords} selected={x=>this.setState({currentRecord: x})}/>
                    {recordEditor}
                </div>
            </div>
        )
    }
}
