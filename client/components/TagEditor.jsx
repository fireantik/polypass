"use strict";

import React from 'react';
import PureComponent from 'react-pure-render/component';
import {EditingType} from './../DataTypes/index.es6';
import {setTag, doneEditingTag} from './../GlobalState.es6';

import { Input, ButtonInput } from 'react-bootstrap';

export class TagEditor extends React.Component {
	handleChange(){
		let tag = this.props.tag.Set({
			name: this.refs.name.getValue()
		});

		setTag(this.props.tagId, tag);
	}

	render() {
		var label = "Tag name";
		var style = undefined;

		let name = this.props.tag.name;
		let cnt = this.props.tags.count(t => t.name == name);
		if(cnt != 1){
			label = `Tag name - There are ${cnt} tags with this name`;
			style = "warning";
		}

		return <Input
			ref="name"
			type="text"
			label={label}
			bsStyle={style}
			value={name}
			placeholder="Tag name"
			hasFeedback
			onChange={this.handleChange.bind(this)}
		/>
	}
}
