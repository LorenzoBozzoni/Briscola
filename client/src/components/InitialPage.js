import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {socket} from '../components/LoginPage.js'

export class InitialPage extends Component {
  state = {
    visibilitySpinner: "hidden"
  }

  switchSpinnerState(){
    if (this.state.visibilitySpinner === "hidden")
        this.setState({visibilitySpinner:"visible"})
    else            
        this.setState({visibilitySpinner:"hidden"}) 
  } 

  gameTypeSelected(modalità){
    socket.emit('gameTypeSelected', modalità);
    this.setState({visibilitySpinner:"visible"})
    // Nell'attesa della risposta (evento socket partitaIniziata) si potrebbe rendere visibile il simbolo di attesa
  }
  
  render (){
    return(
    <>
    <div className="d-grid gap-2 d-md-block">
        <button className="btn btn-primary" type="button" onClick={() => this.gameTypeSelected("single")}><Link to="./partita">Single Player</Link></button>
        <button className="btn btn-primary" type="button" onClick={() => this.gameTypeSelected("multi")}><Link to="./partita">Random multiplayer</Link></button>
        <button className="btn btn-primary" type="button" onClick={() => this.gameTypeSelected("friend")}>Play with a friend</button>
    </div>
    <div className="spinner-border text-primary" role="status" id="spinner" style={{visibility:this.state.visibilitySpinner}}>
        <span className="visually-hidden"  style={{visibility:this.state.visibilitySpinner}}>Loading...</span>
    </div>
    </>
  )}
}


