import React from 'react'
import {cartaGiocata} from '../index.js'
import {Navbar} from './Navbar.js'
import 'bootstrap/dist/css/bootstrap.css';


export function GameField() {
  const handleClick = event => {
    cartaGiocata(event.currentTarget.id);
  };
  return (
    <>
    <Navbar>ehi</Navbar>
    <div className="container text-center">
        
    <div className="row">
      <div className="col" id="FirstPlayerFirstCard" onClick={handleClick}>col</div>
      <div className="col" id="FirstPlayerSecondCard" onClick={handleClick}>col</div>
      <div className="col" id="FirstPlayerThirdCard" onClick={handleClick}>col</div>
    </div>
    <div className="row">
      <div className="col-4">col-4</div>        
      <div className="col-8">col-8</div>
    </div>
    <div className="row">
      <div className="col" id="SecondPlayerFirstCard" onClick={handleClick}>col</div>
      <div className="col" id="SecondPlayerSecondCard" onClick={handleClick}>col</div>
      <div className="col" id="SecondPlayerThirdCard" onClick={handleClick}>col</div>
    </div>
  </div>
  </>
  )
}
