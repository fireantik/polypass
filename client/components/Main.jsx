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
            activeRecords: Immutable.Set(props.data.get('records').keys()),
            currentRecord: null
        }
    }

    get tags(){
        return this.props.data.get('tags');
    }

	get records(){
		return this.props.data.get('records');
	}

	getTagsFor(id){
		return Immutable.Set(this.tags.filter(t=>t.get('records').contains(id)).keys());
	}

    filterRecords(ids){
        if (ids.isEmpty()) this.setState({activeRecords: Immutable.Set(this.records.keys())});
        else this.setState({activeRecords: ids});
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

    render() {
        var recordEditor = false;

        if(this.state.currentRecord){
			let id = this.state.currentRecord;
            recordEditor = <RecordEditor
				activeTags={this.getTagsFor(id)}
				tags={this.tags}
				setTags={this.setTags.bind(this)}
				key={id}
				record={this.records.get(id)}
				updateRecord={this.recordChanged.bind(this, id)}
				recordId={id}
			/>;
        }

        return (
            <div id="app">
                <Header id="header"/>
                <div id="tabs">
                    <TagSelector tags={this.tags} update={this.filterRecords.bind(this)}/>
                    <RecordSelector records={this.records} activeRecords={this.state.activeRecords} selected={x=>this.setState({currentRecord: x})}/>
                    {recordEditor}
                </div>
            </div>
        )
    }
}
