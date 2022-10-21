import React from 'react'
import {Navbar} from './Navbar.js'
import 'bootstrap/dist/css/bootstrap.css';
import {socket} from "./LoginPage.js"

export function GameField() {
  const handleClick = event => {
    cartaGiocata(event.currentTarget.id);      // Metodo serve per sapere quale elemento ha passato attivato evento click (non si riesce direttamente dall'elemento)
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


function cartaGiocata(id){
  window.alert(id);
  if (socket.connected){    // verifichiamo di essere connessi prima di inviare il click
    socket.emit("cartaGiocata", )
  }
}
