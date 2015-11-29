"use strict";

import React from 'react';
import Immutable from 'immutable';

class EditableInput extends React.Component {
    changed(){
        this.props.changed(this.refs.input.value);
    }

    render(){
        var type = this.props.password ? "password" : "text";

        return <input type={type} ref="input" defaultValue={this.props.value} onChange={this.changed.bind(this)}/>
    }
}

class TextField extends React.Component {
    render(){
        let field = this.props.field;
        return (
          <div>
              <span>{field.get('name')}</span>
              <EditableInput value={field.get('value')} password={this.props.password} changed={x=>this.props.changed(field.set('value', x))} />
          </div>
        );
    }
}


export class RecordEditor extends React.Component {
    constructor(props){
        super(props);
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
                case "password": type = TextField; props.password = true; break;
            }

            fields.push(React.createElement(type, props));
        }

        return (
            <div>
                <EditableInput value={this.props.record.get('name')} changed={x=>this.changed(this.props.record.set('name', x))}/>
                {fields}
            </div>
        );
    }
}