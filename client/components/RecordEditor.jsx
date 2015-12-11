"use strict";

import React from 'react';
import Immutable from 'immutable';
import Crypto from './../../common/Crypto.js';
import {Panel, Input, Button, ButtonInput} from 'react-bootstrap';
import ReactZeroClipboard from 'react-zeroclipboard';
import {PasswordGenerator} from './PasswordGenerator.jsx';

class TextField extends React.Component {
    handleChange() {
        this.props.changed(this.props.field.set('value', this.refs.input.getValue()));
    }

    render(){
        let field = this.props.field;
        return (
            <Input ref="input" type="text" label={field.get('name')} value={field.get('value')}
                   onChange={this.handleChange.bind(this)}/>
        );
    }
}

class CopyBtn extends React.Component {
    render() {
        return (
            <ReactZeroClipboard text={this.props.val}>
                <Button bsStyle="success" data-clipboard-target="#bar">
                    <i className="fa fa-files-o"/> Copy
                </Button>
            </ReactZeroClipboard>
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
        var pwgen = false;

        if (this.state.generating) {
            pwgen =
                <PasswordGenerator onClose={_=>this.setState({generating: false})} onValue={this.onValue.bind(this)}/>;
        }

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
        this.props.changed(this.props.field.set('value', x));
    }

    handleChange() {
        this.props.changed(this.props.field.set('value', this.refs.input.getValue()));
    }

    render() {
        let field = this.props.field;
        let type = this.state.shown ? "text" : "password";

        var addons = [];
        var showCls = "fa fa-eye" + (this.state.shown ? "-slash" : "");

        addons.push(<GenerateBtn key="generate" onGenerated={this.handleGenerate.bind(this)}/>);
        addons.push(<Button key="show" onClick={x=>this.setState({shown: !this.state.shown})}><i
            className={showCls}/> {this.state.shown ? "Hide" : "Show"}</Button>);
        addons.push(<CopyBtn key="copy" val={field.get('value')}/>);

        return (
            <Input ref="input" type={type} label={field.get('name')} value={field.get('value')}
                   onChange={this.handleChange.bind(this)} buttonAfter={addons}/>
        );
    }
}

class TagLabel extends React.Component {
	render(){
		return (
			<span className="label label-default tag-label">
				<button onClick={this.props.removeTag.bind(null, this.props.record.get('id'), this.props.tag.get('id'))}>
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
			addingTag: false,
			value: ""
		};
	}

	reset(){
		this.setState({addingTag: false, value: ""});
	}

	add(e){
		e.preventDefault();
		let name = this.refs.tag.value;
		let tags;

		let nameTag = this.props.tags.find(t=>t.get('name') == name);
		if(nameTag){
			let records = nameTag.get('records').push(this.props.recordId);
			let tag = nameTag.set('records', records);
			tags = this.props.tags.set(this.props.tags.indexOf(nameTag), tag);
		}
		else {
			let tagJS = {id: Crypto.randomId(), name: name, records: [this.props.recordId]};
			let tag = Immutable.fromJS(tagJS);
			tags = this.props.tags.push(tag);
		}

		this.props.setTags(tags);
		this.reset();
	}

	render(){
		if(this.state.addingTag){
			let addons = [
				<Button key="cancel" type="reset" bsStyle="warning" bsSize="small" onClick={this.reset.bind(this)}>Cancel</Button>,
				<Button key="submit" type="submit" bsStyle="success" bsSize="small" onClick={this.add.bind(this)}>Add</Button>
			];

			return (
				<form onSubmit={this.add.bind(this)} className="form-inline" style={{display: "inline-block"}}>
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


export class RecordEditor extends React.Component {
    constructor(props){
        super(props);
		this.state = {
			addingTag: false
		};

        this.updateFields(props.record.get('fields'));
    }

    componentWillReceiveProps(props){
        let fields = props.record.get('fields');
        if(this.props.record.get('fields') != fields) this.updateFields(fields);
    }

    updateFields(fields){
        this.fields = fields.reduce((prev, next) => prev.set(next.get('id'), next), Immutable.Map());
    }

    nameChanged(name){
        this.props.changed(this.props.record.set('name', name));
    }

    changed(record){
        this.props.changed(record);
    }

    fieldChanged(id, value){
        this.changed(this.props.record.set('fields', this.fields.set(id, value).toSet()));
    }

	removeTag(recordId, tagId){
		let oldTag = this.props.tags.find(t=>t.get('id') == tagId);
		let newTag = oldTag.set('records', oldTag.get('records').delete(oldTag.get('records').indexOf(recordId)));

		let oldIndex = this.props.tags.indexOf(oldTag);
		let tags;
		if(newTag.get('records').isEmpty()){
			tags = this.props.tags.delete(oldIndex);
		}
		else {
			tags = this.props.tags.set(oldIndex, newTag);
		}

		this.props.setTags(tags);
	}

    render(){
        var fields = [];
        for(var field of this.fields.values()){
            let type;
            let props = {
                field: field,
                key: field.get('id'),
                changed: this.fieldChanged.bind(this, field.get('id'))
            };

            switch(field.get('type')){
                case "text": type = TextField; break;
                case "password":
                    type = PasswordField;
                    break;
            }

            fields.push(React.createElement(type, props));
        }


        // <EditableInput value={this.props.record.get('name')} changed={x=>this.changed(this.props.record.set('name', x))}/>
		let tags = this.props.getTags(this.props.record.get('id')).map(t=><TagLabel removeTag={this.removeTag.bind(this)} key={t.get('id')} tag={t} record={this.props.record} />);
        return (
            <div id="record-tab" className="tab">
				<div className="panel panel-default">
					<div className="panel-heading" id="record-header">
						<h3 className="panel-title">{this.props.record.get('name')}</h3>
						<div className="pull-right">
							<AddTagForm tags={this.props.tags} setTags={this.props.setTags} recordId={this.props.record.get('id')} />
							{tags}
						</div>
					</div>
					<div className="panel-body">
                    	{fields}
					</div>
				</div>
            </div>
        );
    }
}
