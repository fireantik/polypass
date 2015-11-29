"use strict";

import React from 'react';

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