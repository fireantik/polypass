"use strict";

import React from 'react';
import Immutable from 'immutable';
import Crypto from './../../common/Crypto.js';
import {Panel, Input, Button, ButtonInput, ButtonGroup, DropdownButton, MenuItem} from 'react-bootstrap';
import {PasswordGenerator} from './PasswordGenerator.jsx';
import {changeField, deleteRecord, setRecordTags, setTags, addRecordTag, startEditingField, startEditingRecord, addField, fileFieldSet, downloadFile} from './../GlobalState.es6';
import CopyToClipboard from 'react-copy-to-clipboard';
import {RecordTagSector} from './RecordTagComponent.jsx';
import {FieldType} from '../DataTypes/index.es6';
import FA from './FontAwesome.jsx';

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

class CopyBtn extends React.Component {
	render() {
		return (
			<CopyToClipboard text={this.props.val}>
				<Button bsStyle="info">
					<FA icon="files-o"/><XSH> Copy</XSH>
				</Button>
			</CopyToClipboard>
		);
	}
}


class GenerateBtn extends React.Component {
	render() {
		return (
			<Button href={this.props.state.pwEditHash(this.props.fieldId)}>
				<FA icon="magic"/><XSH> Generate</XSH>
			</Button>
		);
	}
}

class XSH extends React.Component {
	render(){
		return <span className="hidden-xs">{this.props.children}</span>
	}
}

class TextField extends React.Component {
	constructor(props) {
		super(props);
		this.state = {shown: false};
	}

	handleChange() {
		let val = this.refs.input.getValue();
		let field = this.props.field.set('value', val);
		this.props.onChange(field);
	}

	render() {
		let field = this.props.field;
		var type = this.props.type;

		var addons = [];


		if (this.props.type == "password") {
			type = this.state.shown ? "text" : "password"
			var icon = "eye" + (this.state.shown ? "-slash" : "");
			addons.push(<GenerateBtn key="generate" state={this.props.state} fieldId={this.props.fieldId}/>);
			addons.push(
				<Button key="show" onClick={x=>this.setState({shown: !this.state.shown})}>
					<FA icon={icon}/><XSH> {this.state.shown ? "Hide" : "Show"}</XSH>
				</Button>
			);
		}
		addons.push(
			<Button key="edit" href={this.props.state.fieldEditHash(this.props.fieldId)}>
				<FA icon="cog"/><XSH> Edit</XSH>
			</Button>
		);
		addons.push(<CopyBtn key="copy" val={field.value}/>);

		return (
			<Input ref="input"
				   type={type}
				   label={field.name}
				   value={field.value}
				   onChange={this.handleChange.bind(this)}
				   buttonAfter={addons}
			/>
		);
	}
}

class FileField extends React.Component {
	handleChange(e){
		fileFieldSet(this.props.recordId, this.props.fieldId, e.target.files[0]);
	}

	render(){
		let field = this.props.field;
		var addons = [];

		addons.push(
			<Button key="browse" className="btn-file">
				<FA icon="folder-open"/><XSH> Browse</XSH> <input type="file" onChange={this.handleChange.bind(this)}/>
			</Button>
		);
		addons.push(
			<Button key="edit" href={this.props.state.fieldEditHash(this.props.fieldId)}>
				<FA icon="cog"/><XSH> Edit</XSH>
			</Button>
		);
		addons.push(
			<Button key="download" bsStyle="info" onClick={downloadFile.bind(null, this.props.recordId, this.props.fieldId)}>
				<FA icon="download"/><XSH> Download</XSH>
			</Button>
		);

		return (
			<Input type="text"
				   label={field.name + (field.value.size && !field.value.uploaded ? " (Uploading...)" : "")}
				   value={field.value.fileName}
				   buttonAfter={addons}
				   disabled
			/>
		);
	}
}

export class RecordEditor extends React.Component {
	get fields() {
		let record = this.props.record;

		var fields = [];

		for (var [key, field] of record.fields) {
			var type = TextField;
			var props = {
				field: field,
				key: key,
				onChange: changeField.bind(null, this.props.id, key),
				recordId: this.props.id,
				fieldId: key,
				state: this.props.state
			};

			switch (field.type) {
				case FieldType.text:
					props.type = "text";
					break;
				case FieldType.password:
					props.type = "password";
					break;
				case FieldType.email:
					props.type = "email";
					break;
				case FieldType.url:
					props.type = "text";
					break;
				case FieldType.file:
					type = FileField;
					break;
			}

			fields.push(React.createElement(type, props));
		}

		return fields;
	}

	render() {
		let record = this.props.record;
		let id = this.props.id;

		let fieldTypes = Object.keys(FieldType)
			.map(x=>FieldType[x])
			.map(t =>
				<MenuItem eventKey={t} key={t} onSelect={addField.bind(null, id, t)}>
					{capitalizeFirstLetter(t)}
				</MenuItem>
			);

		return (
			<div className="panel panel-default">
				<div className="panel-heading" id="record-header">
					<h3 className="panel-title">{record.name}</h3>
					<RecordTagSector
						tags={this.props.tags}
						recordTags={record.tags}
						recordId={id}
					/>
				</div>
				<div className="panel-body">
					{this.fields}

					<ButtonGroup>
						<Button bsStyle="danger" onClick={deleteRecord.bind(null, id)}><FA icon="trash"/> Delete record</Button>
						<DropdownButton title="Add field" id="addNewField">
							{fieldTypes}
						</DropdownButton>
						<Button onClick={startEditingRecord.bind(null, id)}><FA icon="cog"/> Edit record</Button>
					</ButtonGroup>
				</div>
			</div>
		);
	}
}
