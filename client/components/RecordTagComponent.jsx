"use strict";

import React from 'react';
import Immutable from 'immutable';
import Crypto from './../../common/Crypto.js';
import {Panel, Input, Button, ButtonInput, ButtonGroup} from 'react-bootstrap';
import {setRecordTags, setTags, addRecordTag} from './../GlobalState.es6';

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
