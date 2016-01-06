"use strict";

import React from 'react';
import PureComponent from 'react-pure-render/component';
import {EditingType, ShowType} from './../DataTypes/index.es6';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import {NewRecordType, createNewRecord} from '../GlobalState.es6';

export class Header extends PureComponent {
	render() {
		return (
			<Navbar fixedTop>
				<Navbar.Header>
					<Navbar.Brand className="hidden-xs">
						<a href="#">PolyPass</a>
					</Navbar.Brand>
					<Nav id="navbar_showtype">
						<NavItem eventKey={1} href={this.props.state.makeShowLink(ShowType.tags)}
								 active={this.props.state.showType == ShowType.tags}>
							Tags
						</NavItem>
						<NavItem eventKey={2} href={this.props.state.makeShowLink(ShowType.records)}
								 active={this.props.state.showType == ShowType.records}>
							Records
						</NavItem>
						<NavItem className="hidden-sm" eventKey={3}
								 href={this.props.state.makeShowLink(ShowType.editor)}
								 active={this.props.state.showType == ShowType.editor}>
							Editor
						</NavItem>
					</Nav>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav>
						<NavDropdown eventKey={10} title="New record" id="navDropdown">
							<MenuItem eventKey={10.1} onSelect={createNewRecord.bind(null, NewRecordType.simple)}>Simple</MenuItem>
							<MenuItem eventKey={10.2} onSelect={createNewRecord.bind(null, NewRecordType.web_email)}>Website (email)</MenuItem>
							<MenuItem eventKey={10.3} onSelect={createNewRecord.bind(null, NewRecordType.web_username)}>Website (username)</MenuItem>
							<MenuItem eventKey={10.4} onSelect={createNewRecord.bind(null, NewRecordType.keypair)}>Key pair</MenuItem>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}
