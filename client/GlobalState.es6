"use strict";

import {MasterState, MasterStateData, ApiState} from './DataTypes/index.es6';
import EventEmitter from 'events';
import {getInfo, decryptPriv, genKey, register, readBlock, putBlock} from './Api.es6';
var Block = require('./Block.js');
var Crypto = require('./../common/Crypto.js');

var state = null;
var saveDataTimeout = null;
export const emitter = new EventEmitter();

export function setState(newState){
	if(state && state.data != newState.data){
		changeMainState({unsavedChanges: true});

		if(saveDataTimeout) clearTimeout(saveDataTimeout);
		saveDataTimeout = setTimeout(uploadMainBlock, 200, newState.data);
	}

	state = newState;
	emitter.emit("new state", state);
}

export function setInitialState(){
	setState(new MasterState());
}

export function uploadMainBlock(data){
	console.log("uploading...", data.toJS());
	saveDataTimeout = null;
	let str = JSON.stringify(data.toJS());
	let block = new Block(state.api.crypto);
	block.setLean(new Buffer(str));
	putBlock(state.api.uid, 0, block, state.api.privateKey)
	.then(_ => {
		if(data == state.data) changeMainState({unsavedChanges: false});
	});
}

export function setData(data){
	setState(state.Set({data:  data}));
}

export function changeMainState(changes){
	setState(state.Set({state: state.state.Set(changes)}));
}

export function loadData(jsData){
	setData(new MasterStateData(jsData));
}

export function setApi(api){
	setState(state.Set({api:  api}));
}

export function changeApi(changes){
	setApi(state.api.Set(changes));
}

export function api_setUsername(username){
	if(state.api.state != ApiState.askUsername) throw new Error("Invalid state");

	changeApi({username: username, state: ApiState.working});

	getInfo(username).then(info => {
		if(username != state.api.username) return; //username has been changed, this is no longer relevant

		if(info.error) return changeApi({state: ApiState.askRegisterPassword});

		changeApi({
			state: ApiState.askLoginPassword,
			uid: info.uid,
			salt: new Buffer(info.salt, 'hex'),
			publicKey: info.pub,
			privateKey: info.priv
		});
	});
}

export function api_login(password){
	if(state.api.state != ApiState.askLoginPassword && state.api.state != ApiState.passwordInvalid) throw new Error("Invalid state");

	changeApi({state: ApiState.working});
	let tmp_crypto = new Crypto(password, state.api.salt);
	tmp_crypto.init.then(crypto => {
		changeApi({crypto: crypto});
		return decryptPriv(crypto, state.api.privateKey);
	}).then(priv => {
		changeApi({privateKey: priv});

		var block = new Block(state.api.crypto);
		readBlock(state.api.uid, 0, state.api.privateKey).then(data => {
			block.setRaw(data);
			return block.getLean();
		}).then(lean => {
			let str = new Buffer(lean).toString('utf-8');
			let masterData = new MasterStateData(JSON.parse(str));
			setData(masterData);
			changeApi({state: ApiState.ready});
		})
	}, _ => changeApi({state: ApiState.passwordInvalid}));
}

function generateMasterData(){
	function getFields(add) {
		var x = {};
		x[Crypto.randomId()] = {name: "username", type: "text", value: "Napoleon" + add};
		x[Crypto.randomId()] = {name: "password", type: "password", value: Crypto.randomId()};

		return x;
	}

	var data = {
		tags: {},
		records: {}
	};


	var tagId = Crypto.randomId();
	data.records[Crypto.randomId()] = {name: "Record A", fields: getFields("A"), tags: [tagId]};
	data.records[Crypto.randomId()] = {name: "Record B", fields: getFields("B"), tags: []};

	data.tags[tagId] = {name: "Sample tag"};

	return new MasterStateData(data);
}

export function api_register(password) {
	if (state.api.state != ApiState.askRegisterPassword) throw new Error("Invalid state");

	changeApi({state: ApiState.working});

	let tmp_crypto = new Crypto(password);
	tmp_crypto.init.then(crypto => {
		let keys = genKey();
		changeApi({
			privateKey: keys.priv,
			publicKey: keys.pub,
			crypto: crypto,
			salt: crypto.salt
		});
		return register(state.api.username, state.api.crypto, state.api.cert);
	}).then(data => {
		setData(generateMasterData());
		changeApi({state: ApiState.ready, uid: data.uid});
	});
}

export function setCurrentTag(id){
	changeMainState({currentTag: id})
}

export function setCurrentRecord(id){
	changeMainState({currentRecord: id})
}

export function fieldChanged(recordId, fieldId, field){
	let newState = state.setIn(['data', 'records', recordId, 'fields', fieldId], field);
	setState(newState);
}
