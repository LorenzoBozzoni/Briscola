import {React, Component} from 'react'
import {Navbar} from './Navbar.js'
import 'bootstrap/dist/css/bootstrap.css';
import {socket} from "./LoginPage.js"

const cartaCoperta = require('../Images/Retro.jpg');


export class GameField extends Component {
  
  state = {
    primaCarta : "",
    secondaCarta : "",
    terzaCarta : "",
    punteggio1 : 0,
    punteggio2 : 1,          // sbagliato apposta per vedere se setState corregge TODO: ripristinare a 0
    idPartita : 0
  };
    
  
  handleClick = event => {      // Metodo serve per sapere quale elemento ha passato attivato evento click (non si riesce direttamente dall'elemento)
    var id = event.currentTarget.id     // Elemento sul quale è stato fatto il click
    window.alert(id);
    
    if (socket.connected){    // verifichiamo di essere connessi prima di inviare il click
      switch (id) {
        case "SecondPlayerFirstCard":
          socket.emit("cartaGiocataReq", this.state.idPartita, socket.id, this.state.primaCarta)       
          break;
        case "SecondPlayerSecondCard":
          socket.emit("cartaGiocataReq", this.state.idPartita, socket.id, this.state.secondaCarta)
          break;
        case "SecondPlayerThirdCard":
          socket.emit("cartaGiocataReq", this.state.idPartita, socket.id, this.state.terzaCarta)
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
    socket.on("partitaIniziata", (partita, mano) => {
      window.alert("PARTITA INIZIATA, MIOID: "+ socket.id)
      // mano e partita vengono mandate come stringhe, vanno sistemate per formato corretto e poi convertite
      var manoStr = mano.substring(mano.indexOf("{"))
      var partitaStr = partita.substring(partita.indexOf("{"))
      //console.log(manoStr)
      //console.log(partitaStr)
      
      var manoJSON = JSON.parse(manoStr)              // , mano.lastIndexOf("}")
      var partitaJSON = JSON.parse(partitaStr)     // , partita.lastIndexOf("}")
      
      //console.log(partitaJSON)
      //console.log(manoJSON)
      
      
      /*
      this.setState({primaCarta:{cartaCoperta}})
      this.setState({secondaCarta:{cartaCoperta}})
      this.setState({terzaCarta:{cartaCoperta}})
      */
      console.log("cartaCoperta", cartaCoperta)
      console.log("primaCarta",manoJSON.PrimaCarta.ImagePath)

      /*
      this.setState({primaCarta:require(manoJSON.PrimaCarta.ImagePath)})
      this.setState({secondaCarta:require(manoJSON.SecondaCarta.ImagePath)})
      this.setState({terzaCarta:require(manoJSON.TerzaCarta.ImagePath)})
      */

      /*
      this.state = {primaCarta:JSON.stringify(manoJSON.PrimaCarta),
                    secondaCarta:JSON.stringify(manoJSON.SecondaCarta),
                    terzaCarta:JSON.stringify(manoJSON.TerzaCarta)}
      */

      // Settiamo la mano iniziale
      this.setState({primaCarta:JSON.stringify(manoJSON.PrimaCarta)})
      this.setState({secondaCarta:JSON.stringify(manoJSON.SecondaCarta)})
      this.setState({terzaCarta:JSON.stringify(manoJSON.TerzaCarta)})
      console.log("STATO" + this.state)

      // Punteggio iniziale, 0 - 0 TODO: statico?
      this.setState({punteggio1:JSON.stringify(partitaJSON.Punteggio1)})
      this.setState({punteggio2:JSON.stringify(partitaJSON.Punteggio2)})

      this.setState({idPartita:JSON.stringify(partitaJSON.IdPartita)})
    })
  

    socket.on("cartaGiocataRes", (outcome, carta) =>{
      if (outcome){
        // se esito positivo alla richiesta di giocare una carta
        switch (carta) {
          case this.state.primaCarta:
            this.setState({primaCarta:"EMPTY"})
            break;
          case this.state.secondaCarta:
            this.setState({secondaCarta:"EMPTY"})
            break;
          case this.state.terzaCarta:
            this.setState({terzaCarta:"EMPTY"})
            break;
          default:
            break;
        }
      }else{
        window.alert("Non puoi giocare la carta")
      }
    })

    socket.on("avversarioDisconnesso", () => {
      window.alert("L'avversario si è disconnesso")
    })
  }
  
  

  render() { 
    return (
      <>
      <Navbar>ehi</Navbar>
      <div className="container text-center">
          
      <div className="row">
        <div className="col" id="FirstPlayerFirstCard" onClick={this.handleClick}>
          <img src={cartaCoperta} alt=""></img>
        </div>
        <div className="col" id="FirstPlayerSecondCard" onClick={this.handleClick}>
          <img src={cartaCoperta} alt=""></img>
        </div>
        <div className="col" id="FirstPlayerThirdCard" onClick={this.handleClick}>
          <img src={cartaCoperta} alt=""></img>
        </div>
        <div className="col" id="FirsePlayerPoints" onClick={this.handleClick}>
          <div>{this.state.punteggio1}</div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">col-4</div>        
        <div className="col-8">col-8</div>
      </div>
      <div className="row">
        <div className="col" id="SecondPlayerFirstCard" onClick={this.handleClick}>
          <div>{this.state.primaCarta}</div> 
        </div>
        <div className="col" id="SecondPlayerSecondCard" onClick={this.handleClick}>
          <div>{this.state.secondaCarta}</div>
        </div>
        <div className="col" id="SecondPlayerThirdCard" onClick={this.handleClick}>
          <div>{this.state.terzaCarta}</div>
        </div>
        <div className="col" id="SecondPlayerPoints" onClick={this.handleClick}>
          <div>{this.state.punteggio2}</div>
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
          <img src={this.state.primaCarta} alt=""></img> 
        </div>
        <div className="col" id="SecondPlayerSecondCard" onClick={this.handleClick}>
          <img src={this.state.secondaCarta} alt=""></img>
        </div>
        <div className="col" id="SecondPlayerThirdCard" onClick={this.handleClick}>
          <img src={this.state.terzaCarta} alt=""></img>
        </div>
      </div>
 */

