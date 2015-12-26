"use strict";

import React from 'react';
import Immutable from 'immutable';
import Crypto from './../../common/Crypto.js';
import {Panel, Input, Button, ButtonInput, ButtonGroup, DropdownButton, MenuItem} from 'react-bootstrap';
import {PasswordGenerator} from './PasswordGenerator.jsx';
import {changeField, deleteRecord, setRecordTags, setTags, addRecordTag, startEditingField, startEditingRecord, addField} from './../GlobalState.es6';
import CopyToClipboard from 'react-copy-to-clipboard';
import {RecordTagSector} from './RecordTagComponent.jsx';
import {FieldType} from '../DataTypes/index.es6';

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

class CopyBtn extends React.Component {
    render() {
        return (
            <CopyToClipboard text={this.props.val}>
                <Button bsStyle="info">
                    <i className="fa fa-files-o"/> Copy
                </Button>
            </CopyToClipboard>
        );
    }
}


class GenerateBtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {generating: false};
    }

    onValue(x) {
        this.setState({generating: false});
        this.props.onGenerated(x);
    }

    render() {
        var pwgen = <PasswordGenerator visible={this.state.generating} onClose={_=>this.setState({generating: false})} onValue={this.onValue.bind(this)}/>;

        return (
            <Button onClick={_=>this.setState({generating: true})}><i className="fa fa-magic"/> Generate{pwgen}</Button>
        );
    }
}

class TextField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {shown: false};
    }

    handleGenerate(x) {
		let field = this.props.field.set('value', x);
        this.props.onChange(field);
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


		if(this.props.type == "password"){
			type = this.state.shown ? "text" : "password"
			var showCls = "fa fa-eye" + (this.state.shown ? "-slash" : "");
			addons.push(<GenerateBtn key="generate" onGenerated={this.handleGenerate.bind(this)}/>);
			addons.push(<Button key="show" onClick={x=>this.setState({shown: !this.state.shown})}><i
				className={showCls}/> {this.state.shown ? "Hide" : "Show"}</Button>);
		}
        addons.push(<Button key="edit" onClick={startEditingField.bind(null, this.props.recordId, this.props.fieldId)}><i className="fa fa-cog"/> Edit</Button>);
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

export class RecordEditor extends React.Component {
	get fields(){
		let record = this.props.record;

		var fields = [];

		for(var [key, field] of record.fields){
			var type = TextField;
			var props = {
				field: field,
				key: key,
				onChange: changeField.bind(null, this.props.id, key),
				recordId: this.props.id,
				fieldId: key
			};

			switch(field.type){
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
			}

			fields.push(React.createElement(type, props));
		}

		return fields;
	}

	render(){
		let record = this.props.record;
		let id = this.props.id;

		let fieldTypes = Object.keys(FieldType).map(x=>FieldType[x]).map(t => <MenuItem eventKey={t} key={t} onSelect={addField.bind(null, id, t)}>{capitalizeFirstLetter(t)}</MenuItem>)

		return (
			<div id="record-tab" className="tab">
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
							<Button onClick={startEditingRecord.bind(null, id)}><i className="fa fa-cog"/> Edit record</Button>
							<DropdownButton title="Add field" id="addNewField">
								{fieldTypes}
							</DropdownButton>
							<Button bsStyle="danger" onClick={deleteRecord.bind(null, id)}><i className="fa fa-trash"/> Delete record</Button>
						</ButtonGroup>
					</div>
				</div>
			</div>
		);
	}
}
