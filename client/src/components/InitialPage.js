import React, {Component} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {socket} from '../components/LoginPage.js'
import { notify } from '../App.js'
import { ToastContainer } from 'react-toastify';
import {Navbar} from './Navbar.js'
import 'react-toastify/dist/ReactToastify.css';
import { ReactSession } from 'react-client-session';
import "./InitialPage.css";


export class InitialPage extends Component {
  state = {
    username :""
  }

  componentDidMount(){
    const username = ReactSession.get("User");
    this.setState({username:username})
    
    // Se username è undefined vuol dire che non è stato fatto l'accesso, si viene reindirizzati alla home del sito
    if (username === undefined){
      notify("non hai fatto il login")
      document.location.href = "/"; 
    }

    // Aggioranto ID associato allo user, necessario per tenere traccia del giocatore dopo disconnessione causata dal cambiamento di pagina
    socket.emit("AggiornaID", username)

    // Evento di richiesta di partita da parte di un amico
    socket.off("RichiestaInizioPartita").on("RichiestaInizioPartita", (userAmico) => {
      notify("Evento partita amico arrivato")
      var risposta = window.prompt(userAmico + " ti sta invitando per una partita, accetti? (si/no)")
      if (risposta.toLowerCase() === "si"){
        socket.emit("RispostaPartitaAmico", risposta, userAmico)
        this.props.navigate("/selectGame/partita")
      }
    })
  }

  // Funzione per emettere evento bottone per scelta tipologia di partita da giocare
  gameTypeSelected(modalità){
    if (modalità !== "friend"){
       socket.emit('gameTypeSelected', modalità, null);
    }else{
      var friend = ""
      friend = window.prompt("Inserisci l'username dell'avversario")
      if(friend !== null){
        if (friend.trim() !== "") {
          socket.emit('gameTypeSelected', modalità, friend);
          this.props.navigate("/selectGame/partita")
        }
        else{
          notify("Username inserito non valido")
        }
      }
    }
  }

  render (){
    return(
    <>
    <Navbar PlayerUsername={this.state.username}>    
    </Navbar>
    <div className="d-grid gap-2 mx-auto" style={{"height":"95vh"}}>
      <Link to="./partita" className="btn btn-primary" id="MultiGameButton" onClick={() => this.gameTypeSelected("multi")}>
        <p className='gameTypeLabel'>RANDOM PLAYER</p>
      </Link>

      <div className="btn btn-primary" id="FriendGameButton" onClick={() => this.gameTypeSelected("friend")}>
        <p className='gameTypeLabel'>PLAY WITH A FRIEND</p>
      </div>
    </div>
    <div style={{height:"0px"}}>
        <ToastContainer/>
    </div>

    </>
  )}
}

// Functional component che incapsula il class component InitialPage per poter sfruttare useNavigate() di react-router-dom
export function InitialPageWithRoute(props) {
  const navigate = useNavigate()
  return (<InitialPage navigate={navigate}></InitialPage>)
}

