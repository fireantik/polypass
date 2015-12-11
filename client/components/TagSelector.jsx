"use strict";

import React from 'react';
import Immutable from 'immutable';

class TagSelectorItem extends React.Component {
    shouldComponentUpdate(props){
        return this.props.tag != props.tag || this.props.active != props.active;
    }

    render(){
        var cls = "custom-list-group-item" + (this.props.active ? " active" : "");

        return (
            <div className={cls} onClick={this.props.changed}>
                <button className="scale">{this.props.tag.get('name')}</button>
                <button><i className="fa fa-pencil-square-o"/></button>
            </div>
        );
    }
}

export class TagSelector extends React.Component {
    constructor(props){
        super(props);
        this.state = {selected: false};
    }

    handleClick(id){
		this.setState({selected: id});
		this.props.update(this.props.tags.get(id).get('records'));
    }

	handleClickAll(){
		this.setState({selected: false});
		this.props.update(Immutable.Set());
	}

	render() {
        let tags = this.props.tags
			.sortBy(x => x.get('name').toLowerCase())
			.map((tag, id) => <TagSelectorItem
				active={this.state.selected == id}
				key={id}
				tag={tag}
				changed={this.handleClick.bind(this, id)}
			/>)
			.toArray();

		let allClass = "custom-list-group-item" + (!this.state.selected ? " active" : "");

        return (
            <div id="tags-tab" className="tab">
                <div className="custom-list-group">
					<div className={allClass} id="show-all-records">
						<button className="scale" onClick={this.handleClickAll.bind(this)}>Show all records</button>
					</div>
                    {tags}
                </div>
            </div>
        )
    }
}
