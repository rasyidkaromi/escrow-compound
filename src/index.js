/* eslint-disable */
/* eslint-disable-next-line */
import { ethers } from 'ethers'


global.CETH = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5"
global.CETH_abi = require('./abi/CETH_Abi.json')
global.isObj = (obj) => { for (var key in obj) {if (obj.hasOwnProperty(key))return true;}return false;}
global.rand = (length) => {
  var result = '';
  for ( var i = 0; i < length; i++ ) {
      result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.length));
  }
  return result;
}
global.ESCROW = '0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926'
global.ESCROW_abi = require('./abi/LFGlobalEscrow.json').abi
global.isAddress = (address) => {
  try {
    ethers.utils.getAddress(address);
  } catch (e) { return false; }
  return true;
}



import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from "react-router-dom";
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import App from './App';
import { EtherProvider } from './context/etherscontext'

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:4000";
const socket = socketIOClient(ENDPOINT, {
  cors: {
    origin: { origins: '*:*'}
  }
});

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <EtherProvider socket={socket}>
        <App />
      </EtherProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

