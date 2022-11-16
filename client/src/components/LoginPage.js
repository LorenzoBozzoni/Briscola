import React, { Component } from 'react'
//import Sfondo1 from 'Images/SfondoIniziale.jpg';
import { Wallpaper } from './Wallpaper.js';
import { io } from 'socket.io-client'
import { notify } from '../App.js'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactSession } from 'react-client-session';


// Oggetto per la comunicazione col server tramite socket.io
export const socket = io('http://localhost:3001',
  {
    transports: ['websocket', 'polling', 'flashsocket'],
    withCredentials: false
  })


export class LoginPage extends Component {
  state = {
    height: "0px",
    visibilityTextBox: "hidden",
    visibilitySpinner: "hidden",
    access: "login"
  }

  access(accessType) {
    // accessType può essere "login" o "signup"
    this.setState({ visibilitySpinner: "visible" })    // switch
    if (!socket.connected) {
      socket.on('connect', () => {
        notify(`Client connesso con id ${socket.id}`)       // Connessione necessaria col server
      })
    } else {
      notify(`Client connesso con id ${socket.id}`)
      var email = document.getElementById("InputEmail1").value;
      var password = document.getElementById("InputPassword1").value;
      if (accessType === "signup") {
        var confirm = document.getElementById("InputPassword2").value;
        // Controllo che la password inserita nel signup sia uguale nelle due textbox
        if (confirm !== password) {
          notify("Password inserite diverse, riprova")
          this.setState({ visibilitySpinner: "hidden" })
          return
        }
      }
      // Emissione evento per accesso al sito
      socket.emit('access', accessType, email, password);
    }

    // Esito operazione di login/signup
    socket.off("accessOutcome").on('accessOutcome', (accessOutcome, user) => {
      this.setState({ visibilitySpinner: "hidden" })  // switch
      if (!accessOutcome) {
        notify("Autenticazione fallita");
      } else {
        notify("Autenticazione riuscita ");
        // Impostiamo il valore di user in memoria (di sessione)
        ReactSession.set("User", user)
        document.location.href = document.location + "selectGame";     // Ci si sposta nella pagina per selezionare il tipo di partita
      }
    })
  }

  // Funzione per alternare il tipo di accesso che si sta facendo, quando si preme lo switch
  switchAccess() {
    if (this.state.visibilityTextBox === "hidden") {
      this.setState({ visibilityTextBox: "visible", access: "signup" })
      this.setState({ height: "auto" })
    } else {
      this.setState({ visibilityTextBox: "hidden", access: "login" })
      this.setState({ height: "0px" })
    }
  }

  render() {
    return (
      <>
      <Wallpaper></Wallpaper>
        <div className="container" >
          <h1 className="display-3">BriscolaJS</h1>
          <div className="form-check form-switch" style={{ float: "right", transform: "scale(1.8)" }}>
            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{this.state.visibilityTextBox === "hidden" ? "Login" : "Signup"}</label>
            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" onClick={() => this.switchAccess()}></input>
          </div>
          <div className="container-sm" style={{ marginTop: "10%", maxWidth: "350px" }}>
            <form>
              <div className="mb-3">
                <label htmlFor="InputEmail1" className="form-label">Email address</label>
                <input type="email" className="form-control" id="InputEmail1" aria-describedby="emailHelp"></input>
                <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
              </div>
              <div className="mb-3">
                <label htmlFor="InputPassword1" className="form-label">Password</label>
                <input type="password" className="form-control" id="InputPassword1"></input>
              </div>
              
              <div className="mb-3" style={{ visibility: this.state.visibilityTextBox, height: this.state.height }} id="hiddenTxtPassword">
                <label htmlFor="InputPassword2" className="form-label">Write password again</label>
                <input type="password" className="form-control" id="InputPassword2"></input>
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="Check1"></input>
                <label className="form-check-label" htmlFor="Check1">Check me out</label>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => this.access(this.state.access)}>{this.state.access}</button>
            </form>

            <div className="spinner-border text-primary" role="status" id="spinner" style={{ visibility: this.state.visibilitySpinner }}>
              <span className="visually-hidden" style={{ visibility: this.state.visibilitySpinner }}>Loading...</span>
            </div>
          </div>
        </div>
        
        <div style={{ height: "0px" }}>
          <ToastContainer />
        </div>        
      </>
    )
  }
}

