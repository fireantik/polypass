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
        this.state = {
            currentTag: false,
            currentRecord: null
        }
    }

    get tags(){
        return this.props.data.get('tags');
    }

	get records(){
		return this.props.data.get('records');
	}

	getRecordIdsForTag(tagId){
		return Immutable.Set(this.records.filter(r=>r.get('tags').contains(tagId)).keys());
	}

    recordChanged(id, value){
        let records = this.records.set(id, value);
        this.props.onUpdate(this.props.data.set('records', records));
    }

	setTags(tags){
		console.log("setting tags to", tags.toJS());
		let newData = this.props.data.set('tags', tags);
		this.props.onUpdate(newData);
	}

	deleteRecord(id){
		let records = this.records.delete(id);
		let data = this.props.data.set('records', records);
		this.props.onUpdate(data);
		this.setState({currentRecord: null});
	}

    render() {
        var recordEditor = false;

        if(this.state.currentRecord){
			let id = this.state.currentRecord;
            recordEditor = <RecordEditor
				tags={this.tags}
				key={id}
				record={this.records.get(id)}
				setTags={this.setTags.bind(this)}
				updateRecord={this.recordChanged.bind(this, id)}
				deleteRecord={this.deleteRecord.bind(this, id)}
			/>;
        }

        return (
            <div id="app">
                <Header id="header"/>
                <div id="tabs">
                    <TagSelector tags={this.tags} update={x => this.setState({currentTag: x})}/>
                    <RecordSelector records={this.records} currentTag={this.state.currentTag} selected={x=>this.setState({currentRecord: x})}/>
                    {recordEditor}
                </div>
            </div>
        )
    }
}
