"use strict";

import React from 'react';
import Immutable from 'immutable';
import {Panel, Input, Button} from 'react-bootstrap';
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
                case "password":
                    type = PasswordField;
                    break;
            }

            fields.push(React.createElement(type, props));
        }


        // <EditableInput value={this.props.record.get('name')} changed={x=>this.changed(this.props.record.set('name', x))}/>
        return (
            <div id="record-tab" className="tab">
                <Panel header={this.props.record.get('name')}>
                    {fields}
                </Panel>
            </div>
        );
    }
}