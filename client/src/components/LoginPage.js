import React, {Component} from 'react'
//import Sfondo1 from 'Images/SfondoIniziale.jpg';
import { io } from 'socket.io-client'

//import Spinner from "./Spinner.js"

const Sfondo1 = require("../Images/SfondoIniziale.jpg")

// messo qua e importato da altre parti perchè pare essere la prima pagina compilata
export const socket = io('http://localhost:3001',
{
    transports: ['websocket', 'polling', 'flashsocket'],
    withCredentials: false
})



export class LoginPage extends Component {
  state = {
    visibilityTextBox: "hidden",
    visibilitySpinner: "hidden",
    access: "login"
    }  

    /*
    switchSpinnerState(){
        if (this.state.visibilitySpinner === "hidden")
            this.setState({visibilitySpinner:"visible"})
        else            
            this.setState({visibilitySpinner:"hidden"})   
    }
    */

    access(accessType){
        // accessType può essere "login" o "signup"
        window.alert("Nel metodo di accesso");
        this.setState({visibilitySpinner:"visible"})    // switch
        if (!socket.connected){
          socket.on('connect', () => {
            window.alert(`Client connesso con id ${socket.id}`)       // connessione necessaria col server
          })
        }else{
          window.alert(`Client connesso con id ${socket.id}`)
          var email = document.getElementById("exampleInputEmail1").value;
          var password = document.getElementById("exampleInputPassword1").value;
          socket.emit('access', accessType, email, password); 
          window.alert("Evento accesso creato")
        }
    
        socket.off("accessOutcome").on('accessOutcome', (accessOutcome) => {
            window.alert("esito: " + accessOutcome);
            window.alert("Ricezione evento accesso: " + accessOutcome);
            this.setState({visibilitySpinner:"hidden"})  // switch
            if (!accessOutcome) {
            //document.getElementById("").setAttribute()
            window.alert("Autenticazione fallita");
            } else {
            document.location.href = document.location + "selectGame"; // ci si sposta nella pagina per selezionare il tipo di partita
            window.alert("Autenticazione riuscita");
            }
        })
    }
    switchAccess(){
        if (this.state.visibilityTextBox === "hidden")
            this.setState({visibilityTextBox:"visible", access:"signup"})
        else            
            this.setState({visibilityTextBox:"hidden", access:"login"})   

    }
  render(){
    return (
        <>
            <div className='row no-gutters'>
                <div className='col no-gutters' style={{height:'100vh',width:'100%'}}>
                    <div className="container">
                        <h1 className="display-3">BriscolaJS</h1>
                        <hr></hr>
                        <div className="container-sm">
                            <form>
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"></input>
                                <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                <input type="password" className="form-control" id="exampleInputPassword1"></input>
                            </div>
                            <div className="mb-3" style={{visibility:this.state.visibilityTextBox}}>
                                <label htmlFor="exampleInputPassword2" className="form-label">Write password again</label>
                                <input type="password" className="form-control" id="exampleInputPassword2"></input>
                            </div>
                            <div className="mb-3 form-check">
                                <input type="checkbox" className="form-check-input" id="exampleCheck1"></input>
                                <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                            </div>
                            <button type="button" className="btn btn-primary" onClick={() => this.access(this.state.access)}>{this.state.access}</button>
                            </form>
                            <div className="form-check form-switch">
                                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Login</label>
                                <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" onClick={() => this.switchAccess()}></input>     
                                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Signup</label>
                            </div>
                            <div className="spinner-border text-primary" role="status" id="spinner" style={{visibility:this.state.visibilitySpinner}}>
                                <span className="visually-hidden"  style={{visibility:this.state.visibilitySpinner}}>Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col no-gutters' style={{height:'100vh',width:'100%'}}>
                    <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="true">
                        <div className="carousel-indicators">
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        </div>
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                            <img src={Sfondo1} className="d-block w-100" alt="ehi1"></img>
                            </div>
                            <div className="carousel-item">
                            <img src={Sfondo1} className="d-block w-100" alt="ehi2"></img>
                            </div>
                            <div className="carousel-item">
                            <img src={Sfondo1} className="d-block w-100" alt="ehi3"></img>
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
      )
  }
}


/*
// FUNZIONE PER MANDARE RICHIESTA LOGIN/SIGNUP AL SERVER
function access(accessType){
    // accessType può essere "login" o "signup"
    window.alert("Nel metodo di accesso");
    switchSpinnerState()
    if (!socket.connected){
      socket.on('connect', () => {
        window.alert(`Client connesso con id ${socket.id}`)       // connessione necessaria col server
      })
    }else{
      var email = document.getElementById("exampleInputEmail1").value;
      var password = document.getElementById("exampleInputPassword1").value;
      socket.emit('access', accessType, email, password); 
      window.alert("Evento accesso creato")
    }
  }
*/
  

/*
// PRELEVA IL RISULTATO DEL LOGIN/SIGNUP
socket.on('accessOutcome', (accessOutcome) => {
    window.alert("esito: " + accessOutcome);
    window.alert("Ricezione evento accesso: " + accessOutcome);
    switchSpinnerState()
    if (!accessOutcome) {
      //document.getElementById("").setAttribute()
      window.alert("Autenticazione fallita");
    } else {
      document.location.href = document.location + "selectGame"; // ci si sposta nella pagina per selezionare il tipo di partita
      window.alert("Autenticazione riuscita");
    }
  })
*/

