"use strict";

import React from 'react';

export class ShouldRegisterForm extends React.Component {
    render(){
        return (
            <div>
                <h2>Username not found, register?</h2>
                <button onClick={this.props.callback.bind(null, true)}>Yes</button>
                <button onClick={this.props.callback.bind(null, false)}>No</button>
            </div>
        )
    }
}