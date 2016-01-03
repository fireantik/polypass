"use strict";

import {MasterState, MasterStateData, ApiState, Tag, EditingType, ShowType, State, Api, Record, Field, FieldType, FileField} from './DataTypes/index.es6';
import EventEmitter from 'events';
import {getInfo, decryptPriv, genKey, register, readBlock, putBlock} from './Api.es6';
var Block = require('./Block.js');
var Crypto = require('./../common/Crypto.js');

var state = null;
var saveDataTimeout = null;
export const emitter = new EventEmitter();

export function setState(newState) {
	if (state && state.data != newState.data) {
		changeMainState({unsavedChanges: true});

		if (saveDataTimeout) clearTimeout(saveDataTimeout);
		saveDataTimeout = setTimeout(uploadMainBlock, 200, newState.data);
	}

	var doUpdateUrl = state && state.state != newState.state;

	state = newState;
	emitter.emit("new state", state);

	if (doUpdateUrl) {
		setTimeout(updateUrl, 1);
	}
}

export function setInitialState() {
	setState(new MasterState());
}

export function setTestState() {
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

export function uploadMainBlock(data) {
	let obj = data.toJS();
	console.log("uploading...", obj);
	if (state.test) return;

	saveDataTimeout = null;
	let str = JSON.stringify(obj);
	let block = new Block(state.api.crypto);
	block.setLean(new Buffer(str));
	putBlock(state.api.uid, 0, block, state.api.privateKey)
		.then(_ => {
			if (data == state.data) changeMainState({unsavedChanges: false});
		});
}

export function setData(data) {
	setState(state.Set({data: data}));
}

export function changeMainState(changes) {
	setState(state.Set({state: state.state.Set(changes)}));
}

export function loadData(jsData) {
	setData(new MasterStateData(jsData));
}

export function setApi(api) {
	setState(state.Set({api: api}));
}

export function changeApi(changes) {
	setApi(state.api.Set(changes));
}

export function api_setUsername(username) {
	if (state.api.state != ApiState.askUsername) throw new Error("Invalid state");

	changeApi({username: username, state: ApiState.working});

	getInfo(username).then(info => {
		if (username != state.api.username) return; //username has been changed, this is no longer relevant

		if (info.error) return changeApi({state: ApiState.askRegisterPassword});

		changeApi({
			state: ApiState.askLoginPassword,
			uid: info.uid,
			salt: new Buffer(info.salt, 'hex'),
			publicKey: info.pub,
			privateKey: info.priv
		});
	});
}

export function api_login(password) {
	if (state.api.state != ApiState.askLoginPassword && state.api.state != ApiState.passwordInvalid) throw new Error("Invalid state");

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
			let data = JSON.parse(str);
			console.log("loading:", data);
			let masterData = new MasterStateData(data);
			setData(masterData);
			urlChanged();
			changeApi({state: ApiState.ready});
		})
	}, _ => changeApi({state: ApiState.passwordInvalid}));
}

function generateMasterData() {
	function getFields(add) {
		var x = {};
		x[Crypto.randomId()] = {name: "username", type: FieldType.text, value: "Napoleon" + add};
		x[Crypto.randomId()] = {name: "password", type: FieldType.password, value: Crypto.randomId()};

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
		urlChanged();
		changeApi({state: ApiState.ready, uid: data.uid});
	});
}

export function setCurrentTag(tagId) {
	changeMainState({currentTag: tagId, showType: ShowType.records});
}

export function setCurrentRecord(recordId) {
	changeMainState({currentRecord: recordId, editingType: EditingType.record, showType: ShowType.editor});
}

export function changeField(recordId, fieldId, field) {
	let newState = state.setIn(['data', 'records', recordId, 'fields', fieldId], field);
	setState(newState);
}

export function deleteRecord(recordId) {
	let newState = state
		.deleteIn(['data', 'records', recordId])
		.setIn(['state', 'currentRecord'], null);

	setState(newState);
}

export function setRecordTags(recordId, tags) {
	let newState = state.setIn(['data', 'records', recordId, 'tags'], tags);
	setState(newState);
}

export function setTags(tags) {
	let newState = state.setIn(['data', 'tags'], tags);
	setState(newState);
}

export function addRecordTag(recordId, tagName) {
	var key = state.data.tags.findKey(t => t.name == tagName);

	if (!key) {
		let tag = new Tag({name: tagName});
		key = Crypto.randomId();
		setTags(state.data.tags.set(key, tag));
	}

	let record = state.data.records.get(recordId);
	setRecordTags(recordId, record.tags.add(key));
}

export function startEditingTag(tagId) {
	changeMainState({currentTag: tagId, currentRecord: null, editingType: EditingType.tag, showType: ShowType.editor});
}

export function doneEditingTag() {
	changeMainState({editingType: EditingType.record, showType: ShowType.tags});
}

export function setTag(tagId, tag) {
	setTags(state.data.tags.set(tagId, tag));
}

export function startEditingField(recordId, fieldId) {
	changeMainState({currentRecord: recordId, currentField: fieldId, editingType: EditingType.field});
}
export function doneEditingField() {
	changeMainState({editingType: EditingType.record, currentField: null});
}

export function deleteField(recordId, fieldId) {
	let st = state.deleteIn(['data', 'records', recordId, 'fields', fieldId]);
	setState(st);
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

function createNewRecord_keypair() {
	return Record.fromJS({
		name: "Record name",
		fields: {}
	});
}

function createNewRecord_website(email) {
	var fields = {};

	fields[Crypto.randomId()] = {
		name: email ? "email" : "username",
		type: email ? FieldType.email : FieldType.text
	};

	fields[Crypto.randomId()] = {
		name: "password",
		type: FieldType.password
	};

	fields[Crypto.randomId()] = {
		name: "url",
		type: FieldType.url
	};

	return Record.fromJS({
		name: "Record name",
		fields: fields
	});
}

function createNewRecord_simple() {
	var fields = {};

	fields[Crypto.randomId()] = {
		name: "username",
		type: FieldType.text
	};

	fields[Crypto.randomId()] = {
		name: "password",
		type: FieldType.password
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
export function createNewRecord(type) {
	let record;
	switch (type) {
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

export function setRecord(recordId, record) {
	let st = state.setIn(['data', 'records', recordId], record);
	setState(st);
}

export function startEditingRecord(recordId) {
	changeMainState({currentRecord: recordId, currentField: null, editingType: EditingType.recordStructure});
}

export function doneEditingRecord() {
	changeMainState({editingType: EditingType.record});
}


/**
 *
 * @param {FieldType} type
 */
export function addField(recordId, type) {
	let field = Field.fromJS({
		type: type
	});
	let id = Crypto.randomId();

	let st = state.setIn(['data', 'records', recordId, 'fields', id], field);
	setState(st);
	startEditingField(recordId, id);
}

export function urlChanged() {
	let map = window.location.hash
		.substring(1)
		.split('&')
		.map(x=>x.split('='))
		.reduce((hash, [key, value]) => {
			hash[key] = value;
			return hash;
		}, {});

	urlHashChanged(map);
}

function urlHashChanged(hashMap) {
	var record = null;
	var tag = null;
	var field = null;
	var type = EditingType.record;
	var showType = ShowType.records;

	if (state.data.tags.has(hashMap.tag)) {
		tag = hashMap.tag;

		if (hashMap.type == EditingType.tag) {
			type = hashMap.type;
		}
	}
	if (type != EditingType.tag && state.data.records.has(hashMap.record)) {
		record = hashMap.record;

		if (hashMap.type == EditingType.recordStructure) {
			type = hashMap.type;
		}
		else if (state.data.records.get(record).fields.has(hashMap.field)) {
			field = hashMap.field;

			if (hashMap.type == EditingType.field || hashMap.type == EditingType.fieldGen) {
				type = hashMap.type;
			}
		}
	}
	if (hashMap.showType == ShowType.editor || hashMap.showType == ShowType.records || hashMap.showType == ShowType.tags) showType = hashMap.showType;

	let obj = {
		currentRecord: record,
		currentField: field,
		currentTag: tag,
		editingType: type,
		showType: showType
	};

	let st = state.state;

	if (
		st.currentRecord != record
		|| st.currentField != field
		|| st.currentTag != tag
		|| st.editingType != type
		|| st.showType != showType
	) {
		changeMainState(obj);
	}
}

export function updateUrl() {
	window.location.hash = state.state.urlHash;
}

export function passwordGenerated(recordId, fieldId, password){
	let st = state.setIn(['data','records', recordId, 'fields', fieldId, 'value'], password);
	setState(st);
 	changeMainState({editingType: EditingType.record, currentField: null, currentRecord: recordId});
}

export function fileFieldSet(recordId, fieldId, file){
	let blockId = state.data.maxBlockId;

	let value = FileField.fromJS({
		fileName: file.name,
		fileSize: file.size,
		blockId: blockId,
		uploaded: false
	});

	let st = state
		.setIn(['data','records', recordId, 'fields', fieldId, 'value'], value)
		.setIn(['data','maxBlockId'], blockId + 1);

	setState(st);

	let reader = new FileReader();

	reader.onload = function(e) {
		let lean = new Buffer(reader.result);
		let block = new Block(state.api.crypto);
		block.setLean(lean);
		putBlock(state.api.uid, blockId, block, state.api.privateKey)
			.then(_ => {
				let stt = state.setIn(['data','records', recordId, 'fields', fieldId, 'value', 'uploaded'], true);
				setState(stt);
			});
	};

	reader.readAsArrayBuffer(file);
}

function downloadFileBuffer(buffer, filename){
	var element = document.createElement('a');
	element.setAttribute('href', 'data:application/octet-stream;charset=utf-16le;base64,' + buffer.toString('base64'));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

export function downloadFile(recordId, fieldId){
	console.log({recordId, fieldId});
	let field = state.data.records.get(recordId).fields.get(fieldId);
	console.log(field.toJS());
	if(field.value.blockId <= 0) return;

	var block = new Block(state.api.crypto);
	readBlock(state.api.uid, field.value.blockId, state.api.privateKey).then(data => {
		block.setRaw(data);
		return block.getLean();
	}).then(lean => {
		downloadFileBuffer(lean, field.value.fileName);
	});
}
