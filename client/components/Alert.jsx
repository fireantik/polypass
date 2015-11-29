"use strict";

import React from 'react';

export class Alert extends React.Component {
    render() {
        return (
            <div>{this.props.message}</div>
        )
    }
}