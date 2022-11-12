import React, {Component} from 'react'
//import Sfondo1 from 'Images/SfondoIniziale.jpg';
import { io } from 'socket.io-client'
import { notify } from '../App.js'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//import Spinner from "./Spinner.js"
/*
const Sfondo1 = require("../Images/SfondoIniziale1.jpg")
const Sfondo2 = require("../Images/SfondoIniziale2.jpg")
const Sfondo3 = require("../Images/SfondoIniziale3.jpg")
*/

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
        this.setState({visibilitySpinner:"visible"})    // switch
        if (!socket.connected){
          socket.on('connect', () => {
            notify(`Client connesso con id ${socket.id}`)       // connessione necessaria col server
          })
        }else{
          notify(`Client connesso con id ${socket.id}`)
          var email = document.getElementById("InputEmail1").value;
          var password = document.getElementById("InputPassword1").value;
          if (accessType === "signup") {
            var confirm = document.getElementById("InputPassword2").value;
            if (confirm !== password){
              notify("Password mismatch, retry")
              this.setState({visibilitySpinner:"hidden"})
              return
            }
          }
          socket.emit('access', accessType, email, password); 
        }
    
        socket.off("accessOutcome").on('accessOutcome', (accessOutcome, user) => {
            this.setState({visibilitySpinner:"hidden"})  // switch
            if (!accessOutcome) {
            //document.getElementById("").setAttribute()
            notify("Autenticazione fallita");
            } else {
              notify("Autenticazione riuscita ");
              window.localStorage.setItem("User",user)
              document.location.href = document.location + "selectGame"; // ci si sposta nella pagina per selezionare il tipo di partita
              
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
            <div className="container" >
                <h1 className="display-3">BriscolaJS</h1>
                <div className="form-check form-switch" style={{float:"right", transform:"scale(1.8)"}}>
                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{this.state.visibilityTextBox === "hidden"? "Login": "Signup" }</label>
                        <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" onClick={() => this.switchAccess()}></input>       
                    </div>
                <div className="container-sm" style={{marginTop:"10%", maxWidth:"350px"}}>
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
                    <div className="mb-3" style={{visibility:this.state.visibilityTextBox}} id="hiddenTxtPassword">
                        <label htmlFor="InputPassword2" className="form-label">Write password again</label>
                        <input type="password" className="form-control" id="InputPassword2"></input>
                    </div>
                    <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="Check1"></input>
                        <label className="form-check-label" htmlFor="Check1">Check me out</label>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => this.access(this.state.access)}>{this.state.access}</button>
                    </form>

                    <div className="spinner-border text-primary" role="status" id="spinner" style={{visibility:this.state.visibilitySpinner}}>
                        <span className="visually-hidden"  style={{visibility:this.state.visibilitySpinner}}>Loading...</span>
                    </div>
                </div>
            </div>
            <div style={{height:"0px"}}>
         <ToastContainer/>
         </div>
        </>
      )
  }
}


/*
<label className="form-check-label" htmlFor="flexSwitchCheckDefault" style={{"visibility":this.state.visibilityTextBox}}>Login</label>



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
      var email = document.getElementById("InputEmail1").value;
      var password = document.getElementById("InputPassword1").value;
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



  CAROUSEL


                  <div className='col no-gutters' style={{height:'100vh',width:'100%'}}>
                    <div id="carouselIndicators" className="carousel slide" data-bs-ride="true">
                        <div className="carousel-indicators">
                            <button type="button" data-bs-target="#carouselIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#carouselIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#carouselIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        </div>
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                            <img src={Sfondo1} className="d-block w-100" alt="ehi1"></img>
                            </div>
                            <div className="carousel-item">
                            <img src={Sfondo2} className="d-block w-100" alt="ehi2"></img>
                            </div>
                            <div className="carousel-item">
                            <img src={Sfondo3} className="d-block w-100" alt="ehi3"></img>
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselIndicators" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselIndicators" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
*/

