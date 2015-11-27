"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/App.jsx';

ReactDOM.render(
  <App />,
  document.getElementById('appContainer')
);


/*import {Api} from './Api.js';

function intitialized(api){
    api.writeBlock(0, new Buffer('fireant is da boss')).then(()=>api.getBlock(0)).then(data=>{
       console.log(data.toString('utf-8'));
    });
}

var api = new Api("fireant", {
    getPassword: () => Promise.resolve("fireant is da boss"),
    initialized: () => intitialized(api),
    shouldRegister: () => Promise.resolve(true)
});*/