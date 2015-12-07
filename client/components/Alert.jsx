"use strict";

import React from 'react';

export class Alert extends React.Component {
    render() {
        return (
            <div>{this.props.message}</div>
        )
    }
}

export class AlertList extends React.Component {
    render() {
        return (
            <div>
                {this.props.alerts}
            </div>
        )
    }
}