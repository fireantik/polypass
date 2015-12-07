"use strict";

import React from 'react';
import Immutable from 'immutable';

class TagSelectorItem extends React.Component {
    shouldComponentUpdate(props){
        return this.props.tag != props.tag;
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
        this.state = {selected: Immutable.Map()};
    }

    shouldComponentUpdate(props, state){
        if(this.props.tags == props.tags && this.state.selected == state.selected) return false;
        else return true;
    }

    handleClick(id, tag){
        this.setState((state, props) => {
            state.selected = state.selected.has(id) ? state.selected.delete(id) : state.selected.set(id, tag);

            var records = Immutable.Set(state.selected.values()).flatMap(tag => tag.get('records'));
            props.update(records);
        });
    }

    render() {
        let tags = this.props.tags.map(tag => {
            var id = tag.get('id');
            return <TagSelectorItem active={this.state.selected.has(id)} key={id} tag={tag} changed={this.handleClick.bind(this, id, tag)} />;
        });

        return (
            <div id="tags-tab" className="tab">
                <div className="custom-list-group">
                    {tags}
                </div>
            </div>
        )
    }
}