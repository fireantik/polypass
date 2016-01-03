"use strict";

import React from 'react';
import 'font-awesome-webpack';
import PureComponent from 'react-pure-render/component';

export default class FA extends PureComponent {
	render() {
		return <i className={"fa fa-" + this.props.icon}/>;
	}
}
