import {React, Component} from 'react'
import {Navbar} from './Navbar.js'
import 'bootstrap/dist/css/bootstrap.css';
import {socket} from "./LoginPage.js"
//import "./GameField.css";

const cartaCoperta = require('../Images/Retro.jpg');


export class GameField extends Component {
  
  state = {
    primaCartaMia : "",
    secondaCartaMia : "",
    terzaCartaMia : "",
    primaCartaAvversario : "",
    secondaCartaAvversario : "",
    terzaCartaAvversario : "",

    punteggioMio : 0,
    punteggioAvversario : 1,          // sbagliato apposta per vedere se setState corregge TODO: ripristinare a 0
    idPartita : 0
  };
    
  
  handleClick = event => {      // Metodo serve per sapere quale elemento ha passato attivato evento click (non si riesce direttamente dall'elemento)
    var id = event.currentTarget.id     // Elemento sul quale è stato fatto il click
    window.alert(id);
    
    if (socket.connected){    // verifichiamo di essere connessi prima di inviare il click
      switch (id) {
        case "FirstPlayerFirstCard":
          socket.emit("cartaGiocataReq", this.state.idPartita, this.state.primaCartaMia)       
          break;
        case "FirstPlayerSecondCard":
          socket.emit("cartaGiocataReq", this.state.idPartita, this.state.secondaCartaMia)
          break;
        case "FirstPlayerThirdCard":
          socket.emit("cartaGiocataReq", this.state.idPartita, this.state.terzaCartaMia)
          break;
        case "Mazzo":
          socket.emit("pescaDalMazzo")
          break;
        default:
          break;
      }


      

    }
  };

  //useEffect(){
  //listener(){
  componentDidMount() {
    socket.off("partitaIniziata").on("partitaIniziata", (partita, mano) => {
      window.alert("PARTITA INIZIATA, MIOID: "+ socket.id)
      // mano e partita vengono mandate come stringhe, vanno sistemate per formato corretto e poi convertite 
      var manoJSON = JSON.parse(mano.substring(mano.indexOf("{")))              // , mano.lastIndexOf("}")
      var partitaJSON = JSON.parse(partita.substring(partita.indexOf("{")))     // , partita.lastIndexOf("}")

      console.log("cartaCoperta", cartaCoperta)
      console.log("primaCartaMia",manoJSON.PrimaCarta.ImagePath)

      // Settiamo la mano iniziale
      this.setState({primaCartaMia:JSON.stringify(manoJSON.PrimaCarta)})
      this.setState({secondaCartaMia:JSON.stringify(manoJSON.SecondaCarta)})
      this.setState({terzaCartaMia:JSON.stringify(manoJSON.TerzaCarta)})

      // Carte avversario
      try{
      this.setState({primaCartaAvversario:cartaCoperta})
      this.setState({secondaCartaAvversario:cartaCoperta})
      this.setState({terzaCartaAvversario:cartaCoperta})
      }catch(err){
        window.alert("Errore " + err)
      } 
      console.log("STATO" + this.state)

      // Punteggio iniziale, 0 - 0 TODO: statico?
      if (socket.id === partitaJSON.IdGiocatore1) {
        this.setState({punteggioMio:JSON.stringify(partitaJSON.punteggio1)})
        this.setState({punteggioAvversario:JSON.stringify(partitaJSON.punteggio2)})
      } else {
        // inversione per avere visuale relativa a giocatore, altrimenti tutti e due vedono uguale
        this.setState({punteggioAvversario:JSON.stringify(partitaJSON.punteggio2)})
        this.setState({punteggioMio:JSON.stringify(partitaJSON.punteggio1)})
      }


      this.setState({idPartita:JSON.stringify(partitaJSON.IdPartita)})
    })
  
    // RISPOSTA ALLA RICHIESTA DI METTERE UNA CARTA IN TAVOLA
    socket.off("cartaGiocataRes").on("cartaGiocataRes", (outcome, carta) =>{ 
      window.alert("Risposta per carta giocata, esito " + outcome + " carta: " + carta)
      if (outcome){
        // se esito positivo alla richiesta di giocare una carta
        switch (carta) {
          case this.state.primaCartaMia:
            this.setState({primaCartaMia:"EMPTY"})     // Ovviamente allo svuotamento corrisponderà una "azione grafica" associata
            break;
          case this.state.secondaCartaMia:
            this.setState({secondaCartaMia:"EMPTY"})
            break;
          case this.state.terzaCartaMia:
            this.setState({terzaCartaMia:"EMPTY"})
            break;
          default:
            break;
        }
      }else{
        window.alert("Non puoi giocare la carta")
      }
    })

    // QUANDO L'AVVERSARIO GIOCA LA CARTA VIENE VISUALIZZATO GRAFICAMENTE
    socket.off("cartaGiocataAvversario").on("cartaGiocataAvversario", () => {
      // si può rimuovere graficamente carta a caso però VA VISUALIZZATA IN TAVOLA

      window.alert("L'avversario ha giocato una carta in tavola")
      switch (this.randomNumberInRange(1,3)) {
        case 1:
          this.setState({primaCartaAvversario:"EMPTY"})
          break;
        case 2:
          this.setState({secondaCartaAvversario:"EMPTY"})
          break;
        case 3:
          this.setState({terzaCartaAvversario:"EMPTY"})
          break;
        default:
          window.alert("Carta giocata avversario, case default")
          break;
      }
    })


    socket.on("fineMano", () => {
      // Aggiornamento punteggio
      // Confronto ChiInizia con socket.id e dico se tocca a me o avversario
    })

    socket.on("avversarioDisconnesso", () => {
      window.alert("L'avversario si è disconnesso")
    })
  }


  randomNumberInRange(min, max) {
    // 👇️ get number between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // h-100
  
  render() { 
    return (
      <>
      <Navbar>ehi</Navbar>
      <div className="container text-center">   
          
      <div className="row">
        <div className="col" id="SecondPlayerFirstCard" onClick={this.handleClick}>
          <img src={this.state.primaCartaAvversario} alt=""></img>
        </div>
        <div className="col" id="SecondPlayerSecondCard" onClick={this.handleClick}>
          <img src={this.state.secondaCartaAvversario} alt=""></img>
        </div>
        <div className="col" id="SecondPlayerThirdCard" onClick={this.handleClick}>
          <img src={this.state.terzaCartaAvversario} alt=""></img>
        </div>
        <div className="col" id="SecondPlayerPoints" onClick={this.handleClick}>
          <div>{this.state.punteggioAvversario}</div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">col-4</div>        
        <div className="col-8">col-8</div>
      </div>
      <div className="row BottomDiv">
        <div className="col" id="FirstPlayerFirstCard" onClick={this.handleClick}>
          <div>{this.state.primaCartaMia}</div> 
        </div>
        <div className="col" id="FirstPlayerSecondCard" onClick={this.handleClick}>
          <div>{this.state.secondaCartaMia}</div>
        </div>
        <div className="col" id="FirstPlayerThirdCard" onClick={this.handleClick}>
          <div>{this.state.terzaCartaMia}</div>
        </div>
        <div className="col" id="FirstPlayerPoints" onClick={this.handleClick}>
          <div>{this.state.punteggioMio}</div>
        </div>
      </div>
    </div>
    </>
    )
  }
}



/**
function cartaGiocata(id){
  window.alert(id);
  if (socket.connected){    // verifichiamo di essere connessi prima di inviare il click
    socket.emit("cartaGiocata", )
  }
}


PER LA VISUALIZZAZIONE DELLE CARTE PROPRIE, NON FUNZIONA BTW
      <div className="row">
        <div className="col" id="SecondPlayerFirstCard" onClick={this.handleClick}>
          <img src={this.state.primaCartaMia} alt=""></img> 
        </div>
        <div className="col" id="SecondPlayerSecondCard" onClick={this.handleClick}>
          <img src={this.state.secondaCartaMia} alt=""></img>
        </div>
        <div className="col" id="SecondPlayerThirdCard" onClick={this.handleClick}>
          <img src={this.state.terzaCartaMia} alt=""></img>
        </div>
      </div>
 */

