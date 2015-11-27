"use strict";

import React from 'react';
import {Api} from './../Api.js';

export class UsernameSelector extends React.Component {
    onSubmit(e){
        e.preventDefault();
        var username = this.refs.username.value;
        this.props.onUpdate(username);
    }
    
    render(){
        return (
            <form id="username_form" onSubmit={this.onSubmit.bind(this)}>
                <input type="text" placeholder="Username" ref="username" />
                <input type="submit" />
            </form>
        );
    }
}

export class PasswordSelector extends React.Component {
    onSubmit(e){
        e.preventDefault();
        var password = this.refs.password.value;
        this.props.onUpdate(password);
    }
    
    render(){
        return (
            <form id="password_form" onSubmit={this.onSubmit.bind(this)}>
                <input type="password" placeholder="Password" ref="password" />
                <input type="submit" />
            </form>
        );
    }
}

export class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: null,
            api: null,
            getPasswordCB: null,
            api: null
        };
    }
    
    intialized(api){
        this.state.api = api;
        this.setState(api);
        console.log("api:", api);
    }
    
    usernameChanged(username){
        this.state.username = username;
        var pwProm = new Promise(resolve => {
            this.state.getPasswordCB = resolve;
            this.setState(this.state);
        });
        var api = new Api(username, {
            getPassword: () => pwProm,
            initialized: () => this.intialized.bind(this, api),
            shouldRegister: () => Promise.resolve(true)
        });
    }
    
    passwordSet(password){
        this.state.getPasswordCB(password);
        this.state.getPasswordCB = null;
        this.setState(this.state);
    }
    
    render(){
        if(!this.state.username) return <UsernameSelector onUpdate={this.usernameChanged.bind(this)} />;
        else if(this.state.getPasswordCB) return <PasswordSelector onUpdate={this.passwordSet.bind(this)} />
        else return <h1>Hello world</h1>;
    }
}