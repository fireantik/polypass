"use strict";

import {MasterState, MasterStateData, ApiState, Tag, EditingType, State, Api, Record, Field} from './DataTypes/index.es6';
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

export function setTestState(){
	let data = generateMasterData();
	let st = new State({
		username: "Testicek",
		currentTag: null,
		currentRecord: data.records.keySeq().first()
	});
	let api = new Api({state: ApiState.ready});
	setState(new MasterState({
		data: data,
		state: st,
		api: api,
		test: true
	}));
}

export function uploadMainBlock(data){
	console.log("uploading...", data.toJS());
	if(state.test) return;

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

export function setCurrentTag(tagId){
	changeMainState({currentTag: tagId});
}

export function setCurrentRecord(recordId){
	changeMainState({currentRecord: recordId, editingType: EditingType.record});
}

export function changeField(recordId, fieldId, field){
	let newState = state.setIn(['data', 'records', recordId, 'fields', fieldId], field);
	setState(newState);
}

export function deleteRecord(recordId){
	let newState = state
		.deleteIn(['data', 'records', recordId])
		.setIn(['state', 'currentRecord'], null);

	setState(newState);
}

export function setRecordTags(recordId, tags){
	let newState = state.setIn(['data', 'records', recordId, 'tags'], tags);
	setState(newState);
}

export function setTags(tags){
	let newState = state.setIn(['data', 'tags'], tags);
	setState(newState);
}

export function addRecordTag(recordId, tagName){
	var key = state.data.tags.findKey(t => t.name == tagName);

	if(!key) {
		let tag = new Tag({name: tagName});
		key = Crypto.randomId();
		setTags(state.data.tags.set(key, tag));
	}

	let record = state.data.records.get(recordId);
	setRecordTags(recordId, record.tags.add(key));
}

export function startEditingTag(tagId){
	changeMainState({currentTag: tagId, currentRecord: null, editingType: EditingType.tag});
}

export function doneEditingTag(){
	changeMainState({editingType: EditingType.record});
}

export function setTag(tagId, tag){
	setTags(state.data.tags.set(tagId, tag));
}

export function startEditingField(recordId, fieldId){
	changeMainState({currentRecord: recordId, currentField: fieldId, editingType: EditingType.field});
}
export function doneEditingField(){
	changeMainState({editingType: EditingType.record, currentField: null});
}

/**
 * @readonly
 * @enum {String}
 */
export const NewRecordType = {
	simple: "SIMPLE",
	web_email: "WEBSITE_EMAIL",
	web_username: "WEBSITE_USERNAME",
	keypair: "KEYPAIR"
};

function createNewRecord_keypair(){
	return createNewRecord_simple();
}

function createNewRecord_website(email){
	return createNewRecord_simple();
}

function createNewRecord_simple(){
	var fields = {};

	fields[Crypto.randomId()] = {
		name: "username",
		type: "text"
	};

	fields[Crypto.randomId()] = {
		name: "password",
		type: "password"
	};

	return Record.fromJS({
		name: "Record name",
		fields: fields
	});
}

/**
 *
 * @param {NewRecordType} type
 */
export function createNewRecord(type){
	let record;
	switch (type){
		case NewRecordType.web_email:
			record = createNewRecord_website(true);
			break;
		case NewRecordType.web_username:
			record = createNewRecord_website(false);
			break;
		case NewRecordType.keypair:
			record = createNewRecord_keypair();
			break;
		case NewRecordType.simple:
		default:
			record = createNewRecord_simple()
	}
	let id = Crypto.randomId();

	let st = state.setIn(['data', 'records', id], record);
	setState(st);
	startEditingRecord(id);
}

export function setRecord(recordId, record){
	let st = state.setIn(['data', 'records', recordId], record);
	setState(st);
}

export function startEditingRecord(recordId){
	changeMainState({currentRecord: recordId, currentField: null, editingType: EditingType.recordStructure});
}

export function doneEditingRecord(){
	changeMainState({editingType: EditingType.record});
}

/**
 * @readonly
 * @enum {String}
 */
export const NewFieldType = {
	text: "TEXT",
	password: "PASSWORD"
};


function createNewSimpleField(type){
	return Field.fromJS({
		"type": type
	});
}

/**
 *
 * @param {NewFieldType} type
 */
export function addField(recordId, type){
	let field;
	switch (type){
		case NewFieldType.password:
			field = createNewSimpleField("password");
			break;
		case NewFieldType.text:
		default:
			field = createNewSimpleField("text")
	}
	let id = Crypto.randomId();

	let st = state.setIn(['data', 'records', recordId, 'fields', id], field);
	setState(st);
	startEditingField(recordId, id);
}
