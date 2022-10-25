import {React, Component} from 'react'
import {Navbar} from './Navbar.js'
import 'bootstrap/dist/css/bootstrap.css';
import {socket} from "./LoginPage.js"

const cartaCoperta = require('../Images/Retro.jpg');


export class GameField extends Component {
  
  state = {
    primaCarta : "",
    secondaCarta : "",
    terzaCarta : ""
  };
    
  
  handleClick = event => {      // Metodo serve per sapere quale elemento ha passato attivato evento click (non si riesce direttamente dall'elemento)
    window.alert(event.currentTarget.id);
    if (socket.connected){    // verifichiamo di essere connessi prima di inviare il click
      socket.emit("cartaGiocata", )
    }
  };

  constructor(){
    super()     // serve per non avere problemi con "this" -> https://it.reactjs.org/docs/react-component.html
    //this.listener()
  }

  //useEffect(){
  //listener(){
  componentDidMount() {
    socket.on("partitaIniziata", (partita, mano) => {
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

      this.setState({primaCarta:JSON.stringify(manoJSON.PrimaCarta)})
      this.setState({secondaCarta:JSON.stringify(manoJSON.SecondaCarta)})
      this.setState({terzaCarta:JSON.stringify(manoJSON.TerzaCarta)})

      
      console.log("STATO" + this.state)
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

