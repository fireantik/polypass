"use strict";

import React from 'react';
import {TagSelector} from './TagSelector.jsx';
import {RecordSelector} from './RecordSelector.jsx';
import {RecordEditor} from './RecordEditor.jsx';
import PureComponent from 'react-pure-render/component';
import {EditingType, ShowType} from './../DataTypes/index.es6';
import {TagEditor} from './TagEditor.jsx';
import {FieldEditor} from './FieldEditor.jsx';
import {PasswordGenerator} from './PasswordGenerator.jsx';
import {RecordStructureEditor} from './RecordStructureEditor.jsx';
import {Header} from './Header.jsx';

import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import {NewRecordType, createNewRecord} from '../GlobalState.es6';

export class Main extends PureComponent {
	get recordEditor() {
		let id = this.props.state.currentRecord;

		if (!id) return false;
		return <RecordEditor
			record={this.props.data.records.get(id)}
			id={this.props.state.currentRecord}
			tags={this.props.data.tags}
			state={this.props.state}
			blocks={this.props.blocks}
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

	get passwordGenerator() {
		let fieldId = this.props.state.currentField;
		let recordId = this.props.state.currentRecord;

		return <PasswordGenerator
			fieldId={fieldId}
			recordId={recordId}
			state={this.props.state}
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
			case EditingType.fieldGen:
				editor = this.passwordGenerator;
				break;
			case EditingType.record:
			default:
				editor = this.recordEditor;
		}

		let editorClasses = "col-md-7 col-sm-8" + (state.showType == ShowType.editor ? " active" : "");

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
