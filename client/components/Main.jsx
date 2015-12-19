"use strict";

import React from 'react';
import {TagSelector} from './TagSelector.jsx';
import {RecordSelector} from './RecordSelector.jsx';
import {RecordEditor} from './RecordEditor.jsx';
import PureComponent from 'react-pure-render/component';
import {EditingType} from './../DataTypes/index.es6';
import {TagEditor} from './TagEditor.jsx';

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

export class Main extends PureComponent {
	get recordEditor(){
		let id = this.props.state.currentRecord;

		if(!id) return false;
		return <RecordEditor
			record={this.props.data.records.get(id)}
			id={this.props.state.currentRecord}
			tags={this.props.data.tags}
		/>;
	}

	get tagEditor(){
		let id = this.props.state.currentTag;

		if(!id) return false;
		return <TagEditor tags={this.props.data.tags} tag={this.props.data.tags.get(id)} tagId={id} />
	}

	render() {
		let state = this.props.state;
		let data = this.props.data;

		let editor = state.editingType == EditingType.record ? this.recordEditor : this.tagEditor;

		return (
			<div id="app">
				<Header id="header"/>
				<div id="tabs">
					<TagSelector tags={data.tags} currentTag={state.currentTag}/>
					<RecordSelector records={data.records} currentTag={state.currentTag} currentRecord={state.currentRecord}/>
					{editor}
				</div>
			</div>
		)
	}
}
