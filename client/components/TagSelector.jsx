"use strict";

import React from 'react';
import PureComponent from 'react-pure-render/component';
import {setCurrentTag} from './../GlobalState.es6';

class TagSelectorItem extends PureComponent {
	render(){
		var cls = "custom-list-group-item" + (this.props.active ? " active" : "");

		return (
			<div className={cls} onClick={setCurrentTag.bind(null, this.props.id)}>
				<button className="scale">{this.props.tag.name}</button>
				<button><i className="fa fa-pencil-square-o"/></button>
			</div>
		);
	}
}

export class TagSelector extends PureComponent {
	render(){
		let tags = this.props.tags
			.sortBy(x => x.name.toLowerCase())
			.map((tag, id) => <TagSelectorItem
				active={this.props.currentTag == id}
				id={id}
				key={id}
				tag={tag}
			/>)
			.toArray();

		let allClass = "custom-list-group-item" + (!this.props.currentTag ? " active" : "");

		return (
			<div id="tags-tab" className="tab">
				<div className="custom-list-group">
					<div className={allClass} id="show-all-records">
						<button className="scale" onClick={setCurrentTag.bind(null, false)}>Show all records</button>
					</div>
					{tags}
				</div>
			</div>
		)
	}
}
