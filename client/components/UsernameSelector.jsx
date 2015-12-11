"use strict";

import React from 'react';

export class UsernameSelector extends React.Component {
    onSubmit(e){
        e.preventDefault();
        var username = this.refs.username.value;
        this.props.onUpdate(username);
    }

    render(){
        return (
            <form id="username_form" onSubmit={this.onSubmit.bind(this)}>
                <input type="text" placeholder="Username" ref="username" required />
                <input type="submit" />
            </form>
        );
    }
}
