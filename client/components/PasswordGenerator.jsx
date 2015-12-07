"use strict";

import React from 'react';
import Immutable from 'immutable';
import {Modal, Button, Input, ButtonInput} from 'react-bootstrap';
import Rcslider from 'rc-slider';
import Crypto from './../../common/Crypto.js';

export class PasswordGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {visible: true, keySpace: [], sample: ""};
        //this.recalculate(true);
    }

    generate(e) {
        e.preventDefault();
        this.props.onValue(this.recalculate(false));
        this.setState({visible: false});
    }

    generateKey(keySpace, len) {
        var key = "";
        for (var i = 0; i < len; i++) {
            key += keySpace[Crypto.randomInt(0, keySpace.length)];
        }
        return key;
    }

    recalculate(sample) {
        var keySpace = [];
        console.log("refs:", this.refs);
        if (this.refs.lalpha.checked) "qwertyuiopasdfghjklzxcvbnm".forEach(keySpace.push.bind(keySpace));
        if (this.refs.ualpha.checked) "QWERTYUIOPASDFGHJKLZXCVBNM".forEach(keySpace.push.bind(keySpace));
        if (this.refs.num.checked) "0123456789".forEach(keySpace.push.bind(keySpace));
        if (this.refs.special1.checked) " _-".forEach(keySpace.push.bind(keySpace));
        if (this.refs.special2.checked) "~!@#$%^*()+[]{}:;?|*,.".forEach(keySpace.push.bind(keySpace));

        let len = this.refs.len.value;
        let key = keySpace.length != 0 ? this.generateKey(keySpace, len) : "";

        if (sample) {
            this.setState({
                keySpace: keySpace,
                sample: key
            });
        }
        else {
            return key;
        }
    }

    render() {
        var bind = this.recalculate.bind(this, true);
        var sample = this.state.sample ? <p>Sample key: {this.state.sample}</p> : false;
        var keyspace = <p>Keyspace: {JSON.stringify(this.state.keySpace)}</p>;

        return (
            <Modal show={this.state.visible} onHide={this.props.onClose}>
                <form onSubmit={this.generate.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Password generator</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Key space</h4>
                        <Input ref="lalpha" type="checkbox" label="Lowercase alphabetical - [a-z]" checked
                               onChange={bind}/>
                        <Input ref="ualpha" type="checkbox" label="Uppercase alphabetical - [A-Z]" checked
                               onChange={bind}/>
                        <Input ref="num" type="checkbox" label="Numerical - [0-9]" checked onChange={bind}/>
                        <Input ref="special1" type="checkbox" label="Space, underscore, minus - [ _-]" checked
                               onChange={bind}/>
                        <Input ref="special2" type="checkbox"
                               label="Other special characters - [~!@#$%^*()+[]{}:;?|*,.]" onChange={bind}/>
                        <h4>Size</h4>
                        <Rcslider ref="len" min={1} max={255} defaultValue={16} onChange={bind}/>
                        {sample}
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonInput type="submit" value="Generate"/>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}