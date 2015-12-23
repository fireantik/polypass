"use strict";

import React from 'react';
import Immutable from 'immutable';
import Crypto from './../../common/Crypto.js';
import {Panel, Input, Button, ButtonInput, ButtonGroup} from 'react-bootstrap';
import {PasswordGenerator} from './PasswordGenerator.jsx';
import {fieldChanged, deleteRecord, setRecordTags, setTags, addRecordTag} from './../GlobalState.es6';
import CopyToClipboard from 'react-copy-to-clipboard';

class TextField extends React.Component {
    handleChange() {
		let val = this.refs.input.getValue();
		let field = this.props.field.set('value', val);
        this.props.onChange(field);
    }

    render(){
        return (
            <Input ref="input"
				   type="text"
				   label={this.props.field.name}
				   value={this.props.field.value}
                   onChange={this.handleChange.bind(this)}
			/>
        );
    }
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

class PasswordField extends React.Component {
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
        let type = this.state.shown ? "text" : "password";

        var addons = [];
        var showCls = "fa fa-eye" + (this.state.shown ? "-slash" : "");

        addons.push(<GenerateBtn key="generate" onGenerated={this.handleGenerate.bind(this)}/>);
        addons.push(<Button key="show" onClick={x=>this.setState({shown: !this.state.shown})}><i
            className={showCls}/> {this.state.shown ? "Hide" : "Show"}</Button>);
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

class TagLabel extends React.Component {
	render(){
		return (
			<span className="label label-default tag-label">
				<button onClick={this.props.removeTag.bind(null)}>
					<i className="fa fa-times" />
				</button>
				{this.props.tag.get('name')}
			</span>
		);
	}
}

class AddTagForm extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			addingTag: false
		};
	}

	reset(){
		this.setState({addingTag: false, value: ""});
	}

	handleSubmit(e){
		e.preventDefault();
		let name = this.refs.tag.value;

		addRecordTag(this.props.recordId, name);

		this.reset();
	}

	render(){
		if(this.state.addingTag){
			let addons = [
				<Button key="cancel" type="reset" bsStyle="warning" bsSize="small" onClick={this.reset.bind(this)}><i className="fa fa-times"/> Cancel</Button>,
				<Button key="submit" type="submit" bsStyle="success" bsSize="small"><i className="fa fa-check" /> Add</Button>
			];

			return (
				<form onSubmit={this.handleSubmit.bind(this)} className="form-inline" style={{display: "inline-block"}}>
					<span className="input-group input-group-sm">
						<input type="text" placeholder="Tag name" ref="tag" className="form-control" required/>
						<span className="input-group-btn">
							{addons}
						</span>
					</span>
				</form>
			);
		}
		else {
			return <button className="label label-primary" onClick={x=>this.setState({addingTag: true})}>Add tag</button>;
		}
	}
}

export class RecordTagSector extends React.Component {
	removeTag(tagId){
		let tags = Immutable.Set(this.props.recordTags).delete(tagId);

		setRecordTags(this.props.recordId, tags);
	}

	render(){
		let tags = this.props.tags
			.filter((_, key) => this.props.recordTags.contains(key))
			.map((t, key) => <TagLabel
				key={key}
				tag={t}
				removeTag={this.removeTag.bind(this, key)}
			/>)
			.toArray();


		return (
			<div className="pull-right">
				<AddTagForm
					tags={this.props.tags}
					recordTags={this.props.recordTags}
					recordId={this.props.recordId}
				/>
				{tags}
			</div>
		);
	}
}


/*export class RecordEditor extends React.Component {
    setField(id, value){
		let fields = this.props.record.get('fields').set(id, value);
		let record = this.props.record.set('fields', fields);
		this.props.updateRecord(record);
    }

	setRecordTags(tags){
		let record = this.props.record.set('tags', tags);
		this.props.updateRecord(record);
	}

    render(){
        var fields = [];
        for(var [key, field] of this.props.record.get('fields')){
            let type;
            let props = {
                field: field,
                key: key,
                changed: this.setField.bind(this, key)
            };

            switch(field.get('type')){
                case "text":
					type = TextField;
					break;
                case "password":
                    type = PasswordField;
                    break;
            }

            fields.push(React.createElement(type, props));
        }

        return (
            <div id="record-tab" className="tab">
				<div className="panel panel-default">
					<div className="panel-heading" id="record-header">
						<h3 className="panel-title">{this.props.record.get('name')}</h3>
						<RecordTagSector
							tags={this.props.tags}
							activeTags={this.props.record.get('tags')}
							setRecordTags={this.setRecordTags.bind(this)}
							setTags={this.props.setTags}
						/>
					</div>
					<div className="panel-body">
                    	{fields}

						<ButtonGroup>
							<Button><i className="fa fa-cog"/> Change structure</Button>
							<Button bsStyle="danger" onClick={this.props.deleteRecord}><i className="fa fa-trash"/> Delete record</Button>
						</ButtonGroup>
					</div>
				</div>
            </div>
        );
    }
}*/

export class RecordEditor extends React.Component {
	get fields(){
		let record = this.props.record;

		var fields = [];

		for(var [key, field] of record.fields){
			let type;
			let props = {
				field: field,
				key: key,
				onChange: fieldChanged.bind(null, this.props.id, key)
			};

			switch(field.get('type')){
				case "text":
					type = TextField;
					break;
				case "password":
					type = PasswordField;
					break;
			}

			fields.push(React.createElement(type, props));
		}

		return fields;
	}

	render(){
		let record = this.props.record;

		return (
			<div id="record-tab" className="tab">
				<div className="panel panel-default">
					<div className="panel-heading" id="record-header">
						<h3 className="panel-title">{record.name}</h3>
						<RecordTagSector
							tags={this.props.tags}
							recordTags={record.tags}
							recordId={this.props.id}
						/>
					</div>
					<div className="panel-body">
						{this.fields}

						<ButtonGroup>
							<Button><i className="fa fa-cog"/> Change structure</Button>
							<Button bsStyle="danger" onClick={deleteRecord.bind(null, this.props.id)}><i className="fa fa-trash"/> Delete record</Button>
						</ButtonGroup>
					</div>
				</div>
			</div>
		);
	}
}
