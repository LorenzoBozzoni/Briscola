import React, {Component} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {socket} from '../components/LoginPage.js'
import { notify } from '../App.js'
import { ToastContainer, toast } from 'react-toastify';
import {Navbar} from './Navbar.js'
import 'react-toastify/dist/ReactToastify.css';
import { ReactSession } from 'react-client-session';

const id = socket.id
const singolo = require("../Images/Singolo.jpg")
const multi = require("../Images/ConAvversari.jpg")
const friend = require("../Images/ConAvversario1.jpg")


export class InitialPage extends Component {
  state = {
    visibilitySpinner: "hidden",
    username :""
  }

  componentDidMount(){
    const username = ReactSession.get("User");
    
    this.setState({username:username})
    if (username === undefined){
      notify("non hai fatto il login")
      document.location.href = "/"; 
    }
    socket.emit("AggiornaID", username)

    socket.off("RichiestaInizioPartita").on("RichiestaInizioPartita", (userAmico) => {
      notify("Evento partita amico arrivato")
      var risposta = window.prompt(userAmico + " ti sta invitando per una partita, accetti? (si/no)")
      notify(risposta)
      if (risposta.toLowerCase() === "si"){
        //socket.emit("AggiornaID", username)
        socket.emit("RispostaPartitaAmico", risposta, userAmico)
        //const navigate = useHook()
        this.props.navigate("/selectGame/partita")
        //document.location.href = document.location + "/partita"; 
        window.alert("bloccante")
      }
    })
  }
  

  switchSpinnerState(){
    if (this.state.visibilitySpinner === "hidden")
        this.setState({visibilitySpinner:"visible"})
    else            
        this.setState({visibilitySpinner:"hidden"}) 
  } 

  gameTypeSelected(modalità){
    if (modalità !== "friend"){
       socket.emit('gameTypeSelected', modalità, null);
    }else{
      var friend = window.prompt("Inserisci l'username dell'avversario")
      if (friend.trim() === "" || friend === null){
        notify("Username inserito non valido")
      }else{
        socket.emit('gameTypeSelected', modalità, friend);
      }
      
    }
    
    this.setState({visibilitySpinner:"visible"})
    // Nell'attesa della risposta (evento socket partitaIniziata) si potrebbe rendere visibile il simbolo di attesa
    //await fetch("./Partita")
  }
  
  render (){
    return(
    <>
    <Navbar PlayerId={this.state.username}>    

    </Navbar>
    <div className="d-grid gap-2 mx-auto" style={{"height":"95vh"}}>
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

export function InitialPageWithRoute(props) {
  const navigate = useNavigate()
  return (<InitialPage navigate={navigate}></InitialPage>)
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

