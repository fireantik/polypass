"use strict";

import React from 'react';
import {TagSelector} from './TagSelector.jsx';
import {RecordSelector} from './RecordSelector.jsx';
import {RecordEditor} from './RecordEditor.jsx';
import PureComponent from 'react-pure-render/component';

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
	get editor(){
		let id = this.props.state.currentRecord;

		if(!id) return false;
		return <RecordEditor
			record={this.props.data.records.get(id)}
			id={this.props.state.currentRecord}
		/>;
	}

	render() {
		let state = this.props.state;
		let data = this.props.data;

		return (
			<div id="app">
				<Header id="header"/>
				<div id="tabs">
					<TagSelector tags={data.tags} currentTag={state.currentTag}/>
					<RecordSelector records={data.records} currentTag={state.currentTag} currentRecord={state.currentRecord}/>
					{this.editor}
				</div>
			</div>
		)
	}
}
