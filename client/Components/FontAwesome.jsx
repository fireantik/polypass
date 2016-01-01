"use strict";

import React from 'react';
import 'font-awesome-webpack';

export default class FA extends React.Component {
	render(){
		return <i className={"fa fa-" + this.props.icon}/>;
	}
}
