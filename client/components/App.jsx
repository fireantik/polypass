"use strict";

import React from 'react';
import {Api} from './../Api.js';
import Immutable from 'immutable';
import Crypto from './../../common/Crypto.js';
import {Main} from './Main.jsx';
import {Alert} from './Alert.jsx';
import {UsernameSelector} from './UsernameSelector.jsx';
import {PasswordSelector} from './PasswordSelector.jsx';
import {ShouldRegisterForm} from './ShouldRegisterForm.jsx';

function getInitialData(){
    function getFields(){
        return [
            {id: Crypto.randomId(), name: "username", type: "text", value: "Napoleon"},
            {id: Crypto.randomId(), name: "password", type: "password", value: Crypto.randomId()}
        ];
    }

    var recordA = {id: Crypto.randomId(), name: "Record A", fields: getFields()};
    var recordB = {id: Crypto.randomId(), name: "Record B", fields: getFields()};

    return {
        version: 0,
        tags: [
            {id: Crypto.randomId(), name: "Sample tag", records: [recordA.id]}
        ],
        records: [recordA, recordB]
    };
}

const AppStates = Object.freeze({
    askUsername: "ASK_USERNAME",
    shouldRegister: "SHOULD_REGISTER",
    askPassword: "ASK_PASSWORD",
    loading: "LOADING",
    main: "MAIN"
});

export class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            state: AppStates.askUsername,
            alerts: Immutable.List(),
            maxAlertId: 0
        };
    }
    
    initialized(){
        this.setState({
            api: this.tmpApi,
            getPasswordCB: undefined,
            state: AppStates.loading
        });

        let prom;
        if(this.state.registered) prom = Promise.resolve(getInitialData());
        else prom = this.state.api.getBlock(0).then(lean => JSON.parse(lean));

        prom.then(data => {
            let state = {
                data: Immutable.fromJS(data),
                state: AppStates.main
            };

            if(this.state.registered) state.saveTimeout = setTimeout(this.saveMainBlock.bind(this), 5000);

            this.setState(state);
        });
    }

    removeAlert(alert){
        var index = this.state.alerts.indexOf(alert);
        if(index != -1) this.setState({alerts: this.state.alerts.splice(index, 1)});
    }

    addAlert(what){
        var alert = <Alert key={this.state.maxAlertId++} message={what} />;
        setTimeout(this.removeAlert.bind(this), 2000, alert);
        this.setState({alerts: this.state.alerts.push(alert)});
    }

    usernameChanged(username){
        this.tmpApi = new Api(username, {
            getPassword: () => new Promise(resolve => {
                this.setState({
                    state: AppStates.askPassword,
                    getPasswordCB: password => {
                        this.setState({state: AppStates.loading});
                        resolve(password);
                    }
                });
            }),
            initialized: this.initialized.bind(this),
            shouldRegister: () => new Promise(resolve => {
                this.setState({
                    state: AppStates.shouldRegister,
                    shouldRegisterCB: should => {
                        if(should) {
                            this.setState({state: AppStates.loading, registered: true, shouldRegisterCB: undefined});
                            return resolve(true);
                        }
                        this.setState({state: AppStates.askUsername, shouldRegisterCB: undefined});
                    }
                });
            }),
            invalidPassword: () => {
                this.addAlert("password invalid");
                this.setState({state: AppStates.askPassword});
            }
        });

        this.setState({username: username, state: AppStates.loading});
    }

    saveMainBlock(){
        console.log("saving main block:", this.state.data.toJS());
        var lean = new Buffer(JSON.stringify(this.state.data.toJS()));
        this.state.api.writeBlock(0, lean);
    }

    onMainUpdate(data){
        clearTimeout(this.state.saveTimeout);
        this.setState({
            data: data,
            saveTimeout: setTimeout(this.saveMainBlock.bind(this), 1000)
        });
    }

    getAuthState(){
        if(this.state.state == AppStates.askUsername) return <UsernameSelector onUpdate={this.usernameChanged.bind(this)} />;
        else if(this.state.state == AppStates.askPassword) return <PasswordSelector onUpdate={this.state.getPasswordCB} />;
        else if(this.state.state == AppStates.main) return <Main data={this.state.data} onUpdate={this.onMainUpdate.bind(this)}/>;
        else if(this.state.state == AppStates.shouldRegister) return <ShouldRegisterForm callback={this.state.shouldRegisterCB.bind(this)} />;
        else return <h1>Working...</h1>;
    }
    
    render(){
        return (
            <div>
                <div>
                    {this.state.alerts}
                </div>
                <div>
                    {this.getAuthState()}
                </div>
            </div>
        )
    }
}