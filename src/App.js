/* eslint-disable */
/* eslint-disable-next-line */


import React from 'react';
import { Route } from "react-router-dom";

import './App.css';
import Header from './component/header'
import Escrow from './component/escrow'

const App = () => {
  return (
    <div className="App">
      <Header />
      <Route exact path={"/"} component={Escrow} />
    </div>
  );
}

export default App;
