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
    immPrimaCartaMia : "",
    immSecondaCartaMia : "",
    immTerzaCartaMia : "",
    primaCartaAvversario : "",
    secondaCartaAvversario : "",
    terzaCartaAvversario : "",
    primaCartaTavola : "",
    secondaCartaTavola : "",
    immBriscolaEstratta : "",
    briscolaEstratta: "",
    punteggioMio : 0,
    punteggioAvversario : 1,          // sbagliato apposta per vedere se setState corregge TODO: ripristinare a 0
    idPartita : 0
  };
    
  
  handleClick = event => {      // Metodo serve per sapere quale elemento ha passato attivato evento click (non si riesce direttamente dall'elemento)
    var id = event.currentTarget.id     // Elemento sul quale è stato fatto il click
    window.alert(id);
    
    if (socket.connected){    // verifichiamo di essere connessi prima di inviare il click
      switch (id) {
        case "FirstPlayerFirstCard": {
          socket.emit("cartaGiocataReq", this.state.idPartita, this.state.primaCartaMia)       
          break;
        }
        case "FirstPlayerSecondCard": {
          socket.emit("cartaGiocataReq", this.state.idPartita, this.state.secondaCartaMia)
          break;
        }
        case "FirstPlayerThirdCard": {
          socket.emit("cartaGiocataReq", this.state.idPartita, this.state.terzaCartaMia)
          break;
        }
        default:
          break;
      }
      /*
        case "Mazzo": {
          if (this.state.primaCartaTavola === "" && this.state.secondaCartaTavola === ""){        // Si pesca dal mazzo solo quando non ci sono carte in tavola
            socket.emit("pescaDalMazzoReq", this.state.idPartita)
          }
          
          break;
        }
      */
    }
  };

  //useEffect(){
  //listener(){
  componentDidMount() {
    socket.off("partitaIniziata").on("partitaIniziata", (partita, mano, briscolaEstrattaParam) => {
      window.alert("PARTITA INIZIATA, MIOID: "+ socket.id)
      // mano e partita vengono mandate come stringhe, vanno sistemate per formato corretto e poi convertite 
      var manoJSON = JSON.parse(mano.substring(mano.indexOf("{")))              // , mano.lastIndexOf("}")
      var partitaJSON = JSON.parse(partita.substring(partita.indexOf("{")))     // , partita.lastIndexOf("}")

      // Settiamo la mano iniziale
      this.setState({primaCartaMia: JSON.stringify(manoJSON.PrimaCarta)})
      this.setState({secondaCartaMia: JSON.stringify(manoJSON.SecondaCarta)})
      this.setState({terzaCartaMia: JSON.stringify(manoJSON.TerzaCarta)})
      // Dobbiamo impostare lo stato delle immagini delle carte del giocatore1 a parte
      const percorsoPrima = manoJSON.PrimaCarta.ImagePath.substring(manoJSON.PrimaCarta.ImagePath.lastIndexOf("/")+1,manoJSON.PrimaCarta.ImagePath.lastIndexOf("."))
      const percorsoSeconda = manoJSON.SecondaCarta.ImagePath.substring(manoJSON.SecondaCarta.ImagePath.lastIndexOf("/")+1,manoJSON.SecondaCarta.ImagePath.lastIndexOf("."))
      const percorsoTerza = manoJSON.TerzaCarta.ImagePath.substring(manoJSON.TerzaCarta.ImagePath.lastIndexOf("/")+1,manoJSON.TerzaCarta.ImagePath.lastIndexOf("."))
      // Non si può fare require(manoJSON.PrimaCarta.ImagePath)
      this.setState({immPrimaCartaMia:require("../Images/Piacentine/" + percorsoPrima + ".jpg")})
      this.setState({immSecondaCartaMia:require("../Images/Piacentine/" + percorsoSeconda + ".jpg")})
      this.setState({immTerzaCartaMia:require("../Images/Piacentine/" + percorsoTerza + ".jpg")})

      // Carte avversario
      this.setState({primaCartaAvversario:cartaCoperta})
      this.setState({secondaCartaAvversario:cartaCoperta})
      this.setState({terzaCartaAvversario:cartaCoperta})

      // Punteggio iniziale, 0 - 0 TODO: statico?
      if (socket.id === partitaJSON.IdGiocatore1) {
        this.setState({punteggioMio:JSON.stringify(partitaJSON.Punteggio1)})
        this.setState({punteggioAvversario:JSON.stringify(partitaJSON.Punteggio2)})
      } else {
        // inversione per avere visuale relativa a giocatore, altrimenti tutti e due vedono uguale
        this.setState({punteggioAvversario:JSON.stringify(partitaJSON.Punteggio2)})
        this.setState({punteggioMio:JSON.stringify(partitaJSON.Punteggio1)})
      }

      this.setState({idPartita:JSON.stringify(partitaJSON.IdPartita)})

      briscolaEstrattaParam = JSON.parse(briscolaEstrattaParam.substring(briscolaEstrattaParam.indexOf("{")))
      const cartaBriscolaEstratta = briscolaEstrattaParam.ImagePath.substring(briscolaEstrattaParam.ImagePath.lastIndexOf("/")+1,briscolaEstrattaParam.ImagePath.lastIndexOf("."))
      this.setState({immBriscolaEstratta:require("../Images/Piacentine/"+cartaBriscolaEstratta+".jpg")})
      this.setState({briscolaEstratta:JSON.stringify(briscolaEstrattaParam)})
    })
  
    // RISPOSTA ALLA RICHIESTA DI METTERE UNA CARTA IN TAVOLA
    socket.off("cartaGiocataRes").on("cartaGiocataRes", (outcome, carta, numeroInTavola) =>{ 
      window.alert("Risposta per carta giocata, esito " + outcome + " carta: " + carta)
      if (outcome){
        // se esito positivo alla richiesta di giocare una carta
        switch (carta) {
          case this.state.primaCartaMia:
            this.setState({primaCartaMia:""})     // Ovviamente allo svuotamento corrisponderà una "azione grafica" associata
            this.setState({immPrimaCartaMia : ""})
            break;
          case this.state.secondaCartaMia:
            this.setState({secondaCartaMia:""})
            this.setState({immSecondaCartaMia : ""})
            break;
          case this.state.terzaCartaMia:
            this.setState({terzaCartaMia:""})
            this.setState({immTerzaCartaMia : ""})
            break;
          default:
            break;
        }
        // Visualizzazione carta in tavola 
        var cartaJSON = JSON.parse(carta.substring(carta.indexOf("{")))
        const numeroCarta = cartaJSON.ImagePath.substring(cartaJSON.ImagePath.lastIndexOf("/")+1,cartaJSON.ImagePath.lastIndexOf("."))        
        if (numeroInTavola === 1) {
          this.setState({primaCartaTavola:require("../Images/Piacentine/"+numeroCarta+".jpg")})
        } else {
          this.setState({secondaCartaTavola:require("../Images/Piacentine/"+numeroCarta+".jpg")})
        }
      
      }else{
        window.alert("Non puoi giocare la carta")
      }

    })

    // QUANDO L'AVVERSARIO GIOCA LA CARTA VIENE VISUALIZZATO GRAFICAMENTE
    socket.off("cartaGiocataAvversario").on("cartaGiocataAvversario", (imagePath, numero) => {
      window.alert("L'avversario ha giocato una carta in tavola")
      // si può rimuovere graficamente carta a caso 
      switch (this.randomNumberInRange(1,3)) {
        case 1:
          this.setState({primaCartaAvversario:""})
          break;
        case 2:
          this.setState({secondaCartaAvversario:""})
          break;
        case 3:
          this.setState({terzaCartaAvversario:""})
          break;
        default:
          window.alert("Carta giocata avversario, case default")
          break;
      }

      // visualizzazione in tavola della carta giocata
      const numeroCarta = imagePath.substring(imagePath.lastIndexOf("/")+1,imagePath.lastIndexOf("."))        // TODO: funzione?
      if (numero === 1) {
        this.setState({primaCartaTavola:require("../Images/Piacentine/"+numeroCarta+".jpg")})
      } else {
        this.setState({secondaCartaTavola:require("../Images/Piacentine/"+numeroCarta+".jpg")})
      }

      

    })


    socket.off("fineMano").on("fineMano", (partita, cartaPescata) => {
      window.alert("FINE MANO")
      var partitaJSON = JSON.parse(partita.substring(partita.indexOf("{")))
      var cartaPescataJSON = JSON.parse(cartaPescata.substring(cartaPescata.indexOf("{")))
      // Aggiornamento punteggio
      if (socket.id === partitaJSON.IdGiocatore1) {
        this.setState({punteggioMio:JSON.stringify(partitaJSON.Punteggio1)})
        this.setState({punteggioAvversario:JSON.stringify(partitaJSON.Punteggio2)})
      } else {
        // inversione per avere visuale relativa a giocatore, altrimenti tutti e due vedono uguale
        this.setState({punteggioAvversario:JSON.stringify(partitaJSON.Punteggio1)})
        this.setState({punteggioMio:JSON.stringify(partitaJSON.Punteggio2)})
      }
      // Confronto ChiInizia con socket.id e dico se tocca a me o avversario
      if (socket.id === partitaJSON.ChiInizia){
        window.alert("Tocca a me")
      }

      // Rimuovere le carte in tavola e aggiungere quelle in mano
      const numeroCarta = cartaPescataJSON.ImagePath.substring(cartaPescataJSON.ImagePath.lastIndexOf("/")+1,cartaPescataJSON.ImagePath.lastIndexOf("."))
      
      this.setState({
        primaCartaTavola:"",
        secondaCartaTavola:""
      })

      // Bisogna capire quale carta è stata giocata per capire dove inserire quella appena pescata
      if (this.state.primaCartaMia === "") {
        this.setState({
          immPrimaCartaMia:require("../Images/Piacentine/"+numeroCarta+".jpg"),
          primaCartaMia:cartaPescata
        })
      } else if (this.state.secondaCartaMia === "") {
        this.setState({
          immSecondaCartaMia:require("../Images/Piacentine/"+numeroCarta+".jpg"),
          secondaCartaMia:cartaPescata
        })
      } else {      // TODO: convertire in else if?
        this.setState({
          immTerzaCartaMia:require("../Images/Piacentine/"+numeroCarta+".jpg"),
          terzaCartaMia:cartaPescata
        })
      } 

      if (this.state.primaCartaAvversario === "") {
        this.setState({
          primaCartaAvversario:cartaCoperta
        })
      } else if (this.state.secondaCartaMia === "") {
        this.setState({
          secondaCartaAvversario:cartaCoperta
        })
      } else {      // TODO: convertire in else if?
        this.setState({
          terzaCartaAvversario:cartaCoperta
        })
      } 
      
      

    })

    socket.on("avversarioDisconnesso", () => {
      window.alert("L'avversario si è disconnesso")
    })
  }


  randomNumberInRange(min, max) {
    // 👇️ get number between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  
  render() { 
    return (
      <>
      <Navbar>ehi</Navbar>
      <div className="container text-center">   
          
      <div className="row">
        <div className="col-sm" id="SecondPlayerFirstCard" onClick={this.handleClick}>
          <img src={this.state.primaCartaAvversario} alt=""></img>
        </div>
        <div className="col-sm" id="SecondPlayerSecondCard" onClick={this.handleClick}>
          <img src={this.state.secondaCartaAvversario} alt=""></img>
        </div>
        <div className="col-sm" id="SecondPlayerThirdCard" onClick={this.handleClick}>
          <img src={this.state.terzaCartaAvversario} alt=""></img>
        </div>
        <div className="col-sm" id="SecondPlayerPoints" onClick={this.handleClick}>
          <div>{this.state.punteggioAvversario}</div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm"><img src={cartaCoperta} style={{float: "left"}}></img></div>     
        <div className="col-sm"><img src={this.state.immBriscolaEstratta} style={{float: "left",transform: "rotate(90deg)"}}></img></div>      
        <div className="col-sm"><img src={this.state.primaCartaTavola} alt=""></img></div>
        <div className="col-sm"><img src={this.state.secondaCartaTavola} alt=""></img></div>
      </div>
      <div className="row">
        <div className="col-sm" id="FirstPlayerFirstCard" onClick={this.handleClick}>
          <img src={this.state.immPrimaCartaMia} alt="" style={{ position : "relative",bottom: 0}}></img>
        </div>
        <div className="col-sm" id="FirstPlayerSecondCard" onClick={this.handleClick}>
          <img src={this.state.immSecondaCartaMia} alt="" style={{position : "relative",bottom : 0}}></img>
        </div>
        <div className="col-sm" id="FirstPlayerThirdCard" onClick={this.handleClick}>
          <img src={this.state.immTerzaCartaMia} alt="" style={{position : "relative",bottom : 0}}></img>
        </div>
        <div className="col-sm" id="FirstPlayerPoints" onClick={this.handleClick}>
          <div>{this.state.punteggioMio}</div>
        </div>
      </div>
    </div>
    </>
    )
  }
}

