import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {socket} from '../components/LoginPage.js'
import { notify } from '../App.js'
import { ToastContainer, toast } from 'react-toastify';
import {Navbar} from './Navbar.js'
import 'react-toastify/dist/ReactToastify.css';


const singolo = require("../Images/Singolo.jpg")
const multi = require("../Images/ConAvversari.jpg")
const friend = require("../Images/ConAvversario1.jpg")


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
    //await fetch("./Partita")
  }
  
  render (){
    return(
    <>
    <Navbar>    

    </Navbar>
    <div className="d-grid gap-2 mx-auto">
      <Link to="./partita" className="btn btn-primary" id="SingleGameButton" onClick={() => this.gameTypeSelected("single")}>
        <p className='gameTypeLabel'>SINGLE PLAYER</p>
      </Link>
      <Link to="./partita" className="btn btn-primary" id="MultiGameButton" onClick={() => this.gameTypeSelected("multi")}>
        <p className='gameTypeLabel'>RANDOM PLAYER</p>
      </Link>

      <Link to="./partita" className="btn btn-primary" id="FriendGameButton" onClick={() => this.gameTypeSelected("friend")}>
        <p className='gameTypeLabel'>PLAY WITH A FRIEND</p>
      </Link>
    </div>
    <div style={{height:"0px"}}>
        <ToastContainer/>
    </div>

    </>
  )}
}
//<Link to="./partita">Single Player</Link>


/*
      <div className="spinner-border text-primary" role="status" id="spinner" style={{visibility:this.state.visibilitySpinner}}>
        <span className="visually-hidden"  style={{visibility:this.state.visibilitySpinner}}>Loading...</span>
    </div>



<div className="d-grid gap-2 d-md-block">
      <Link to="./partita">
        <button className="btn btn-primary" type="button" onClick={() => this.gameTypeSelected("single")}>Single Player</button>
      </Link>
      <Link to="./partita">
        <button className="btn btn-primary" type="button" onClick={() => this.gameTypeSelected("multi")}>Random multiplayer</button>
      </Link>
      
        <button className="btn btn-primary" type="button" onClick={() => this.gameTypeSelected("friend")}>Play with a friend</button>
    </div>


Per centrare il testo dentro il button, non funziona

    <p className="text-center">Random multiplayer</p> 
*/

