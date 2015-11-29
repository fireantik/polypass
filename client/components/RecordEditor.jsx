"use strict";

import React from 'react';
import Immutable from 'immutable';

class EditableField extends React.Component {
    changed(){
        this.props.changed(this.refs.input.value);
    }

    render(){
        return <input type="text" ref="input" defaultValue={this.props.value} onChange={this.changed.bind(this)}/>
    }
}

export class RecordEditor extends React.Component {
    nameChanged(name){
        this.props.changed(this.props.record.set('name', name));
    }

    render(){
        return (
            <div>
                <EditableField value={this.props.record.get('name')} changed={this.nameChanged.bind(this)}/>
            </div>
        );
    }
}