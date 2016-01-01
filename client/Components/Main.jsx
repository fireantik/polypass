"use strict";

import React from 'react';
import {TagSelector} from './TagSelector.jsx';
import {RecordSelector} from './RecordSelector.jsx';
import {RecordEditor} from './RecordEditor.jsx';
import PureComponent from 'react-pure-render/component';
import {EditingType, ShowType} from './../DataTypes/index.es6';
import {TagEditor} from './TagEditor.jsx';
import {FieldEditor} from './FieldEditor.jsx';
import {RecordStructureEditor} from './RecordStructureEditor.jsx';


import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import {NewRecordType, createNewRecord} from '../GlobalState.es6';

/*export class Header extends React.Component {
 render() {
 return (
 <Navbar>
 <Navbar.Header>
 <Navbar.Brand>
 <a href="#">PolyPass</a>
 </Navbar.Brand>
 </Navbar.Header>
 <Nav>
 <NavDropdown eventKey={1} title="New record" id="basic-nav-dropdown">
 <MenuItem eventKey={1.1} onSelect={createNewRecord.bind(null, NewRecordType.simple)}>Simple</MenuItem>
 <MenuItem eventKey={1.2} onSelect={createNewRecord.bind(null, NewRecordType.web_email)}>Website (email)</MenuItem>
 <MenuItem eventKey={1.3} onSelect={createNewRecord.bind(null, NewRecordType.web_username)}>Website (username)</MenuItem>
 <MenuItem eventKey={1.4} onSelect={createNewRecord.bind(null, NewRecordType.keypair)}>Key pair</MenuItem>
 </NavDropdown>
 </Nav>
 </Navbar>
 );
 }
 }*/

export class Header extends React.Component {
	render() {
		return (
			<Navbar fixedTop>
				<Navbar.Header>
					<Navbar.Brand>
						<a href="#">PolyPass</a>
					</Navbar.Brand>
					<Nav id="navbar_showtype">
						<NavItem eventKey={1} href={this.props.state.makeShowLink(ShowType.tags)}
								 active={this.props.state.showType == ShowType.tags}>Tags</NavItem>
						<NavItem eventKey={2} href={this.props.state.makeShowLink(ShowType.records)}
								 active={this.props.state.showType == ShowType.records}>Records</NavItem>
						<NavItem className="hidden-sm" eventKey={3}
								 href={this.props.state.makeShowLink(ShowType.editor)}
								 active={this.props.state.showType == ShowType.editor}>Editor</NavItem>
					</Nav>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav>
						<NavDropdown eventKey={10} title="New record">
							<MenuItem eventKey={10.1}
									  onSelect={createNewRecord.bind(null, NewRecordType.simple)}>Simple</MenuItem>
							<MenuItem eventKey={10.2} onSelect={createNewRecord.bind(null, NewRecordType.web_email)}>Website
								(email)</MenuItem>
							<MenuItem eventKey={10.3} onSelect={createNewRecord.bind(null, NewRecordType.web_username)}>Website
								(username)</MenuItem>
							<MenuItem eventKey={10.4} onSelect={createNewRecord.bind(null, NewRecordType.keypair)}>Key
								pair</MenuItem>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}

export class Main extends PureComponent {
	get recordEditor() {
		let id = this.props.state.currentRecord;

		if (!id) return false;
		return <RecordEditor
			record={this.props.data.records.get(id)}
			id={this.props.state.currentRecord}
			tags={this.props.data.tags}
		/>;
	}

	get recordStructureEditor() {
		let id = this.props.state.currentRecord;

		if (!id) return false;
		return <RecordStructureEditor
			record={this.props.data.records.get(id)}
			id={this.props.state.currentRecord}
		/>;
	}

	get tagEditor() {
		let id = this.props.state.currentTag;

		if (!id) return false;
		return <TagEditor tags={this.props.data.tags} tag={this.props.data.tags.get(id)} tagId={id}/>
	}

	get fieldEditor() {
		let fieldId = this.props.state.currentField;
		let recordId = this.props.state.currentRecord;

		return <FieldEditor
			field={this.props.data.records.get(recordId).fields.get(fieldId)}
			fieldId={fieldId}
			recordId={recordId}
		/>
	}

	render() {
		let state = this.props.state;
		let data = this.props.data;

		let editor;
		switch (state.editingType) {
			case EditingType.tag:
				editor = this.tagEditor;
				break;
			case EditingType.field:
				editor = this.fieldEditor;
				break;
			case EditingType.recordStructure:
				editor = this.recordStructureEditor;
				break;
			case EditingType.record:
			default:
				editor = this.recordEditor;
		}

		let editorClasses = "col-md-7 col-sm-8" + (state.showType == ShowType.editor ? " active" : "");

		console.log(state.showType);
		return (
			<div id="app" className="container-fluid">
				<Header state={state}/>
				<div className="row" id="tabs">
					<TagSelector tags={data.tags} currentTag={state.currentTag}
								 active={state.showType == ShowType.tags}/>
					<RecordSelector
						records={data.records}
						currentTag={state.currentTag}
						currentRecord={state.currentRecord}
						active={state.showType == ShowType.records}
					/>
					<div id="record-tab" className={editorClasses}>
						{editor}
					</div>
				</div>
			</div>
		)
	}
}
