import {React, Component} from 'react'
import 'bootstrap/dist/css/bootstrap.css';
import {socket} from "./LoginPage.js"
import { notify } from '../App.js'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    idPartita : 0,
    messaggioAlert : "Ciao"
  };
    
  

  
  handleClick = event => {      // Metodo serve per sapere quale elemento ha passato attivato evento click (non si riesce direttamente dall'elemento)
    var id = event.currentTarget.id     // Elemento sul quale è stato fatto il click
    //window.alert(id);
    
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
      notify("PARTITA INIZIATA, MIOID: "+ socket.id)
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
      this.setState({immPrimaCartaMia:require("../Images/Napoletane/" + percorsoPrima + ".jpg")})
      this.setState({immSecondaCartaMia:require("../Images/Napoletane/" + percorsoSeconda + ".jpg")})
      this.setState({immTerzaCartaMia:require("../Images/Napoletane/" + percorsoTerza + ".jpg")})

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
      this.setState({immBriscolaEstratta:require("../Images/Napoletane/"+cartaBriscolaEstratta+".jpg")})
      this.setState({briscolaEstratta:JSON.stringify(briscolaEstrattaParam)})


      // Evento che viene scatenato quando si preme il pulsante "indietro" del browser
      window.addEventListener('popstate', (event) => {
        if (this.state.idPartita !== 0){
          notify("La partita verrà conclusa")
        }
        socket.emit("abbandonaPartita")
      });
    })
  
    // RISPOSTA ALLA RICHIESTA DI METTERE UNA CARTA IN TAVOLA
    socket.off("cartaGiocataRes").on("cartaGiocataRes", (outcome, carta, numeroInTavola) =>{ 
      //window.alert("Risposta per carta giocata, esito " + outcome + " carta: " + carta)
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
          this.setState({primaCartaTavola:require("../Images/Napoletane/"+numeroCarta+".jpg")})
        } else {
          this.setState({secondaCartaTavola:require("../Images/Napoletane/"+numeroCarta+".jpg")})
        }
      
      }else{
        notify("Non puoi giocare la carta")
      }

    })

    // QUANDO L'AVVERSARIO GIOCA LA CARTA VIENE VISUALIZZATO GRAFICAMENTE
    socket.off("cartaGiocataAvversario").on("cartaGiocataAvversario", (imagePath, numero) => {
      //notify("L'avversario ha giocato una carta in tavola")
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
          notify("Carta giocata avversario, case default")
          break;
      }

      // visualizzazione in tavola della carta giocata
      const numeroCarta = imagePath.substring(imagePath.lastIndexOf("/")+1,imagePath.lastIndexOf("."))        // TODO: funzione?
      if (numero === 1) {
        this.setState({primaCartaTavola:require("../Images/Napoletane/"+numeroCarta+".jpg")})
      } else {
        this.setState({secondaCartaTavola:require("../Images/Napoletane/"+numeroCarta+".jpg")})
      }

      

    })


    socket.off("fineMano").on("fineMano", (partita, cartaPescata) => {
      //notify("FINE MANO")
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
        notify("Tocca a me")
      }

      var str = "Carte rimanenti "+ partitaJSON.CarteRimanenti + " tipo: " + typeof(partitaJSON.CarteRimanenti)
      notify(str)

      if (partitaJSON.CarteRimanenti === 1){
        this.setState({immBriscolaEstratta:""})
      } else if (partitaJSON.CarteRimanenti === 0){
        document.getElementById("Mazzo").setAttribute("visibility","hidden")

      } 
      
      this.setState({
        primaCartaTavola:"",
        secondaCartaTavola:""
      })


      if(cartaPescata !== {}) {  // se non è vuota
      // Rimuovere le carte in tavola e aggiungere quelle in mano
      const numeroCarta = cartaPescataJSON.ImagePath.substring(cartaPescataJSON.ImagePath.lastIndexOf("/")+1,cartaPescataJSON.ImagePath.lastIndexOf("."))

      // Bisogna capire quale carta è stata giocata per capire dove inserire quella appena pescata
      if (this.state.primaCartaMia === "") {
        this.setState({
          immPrimaCartaMia:require("../Images/Napoletane/"+numeroCarta+".jpg"),
          primaCartaMia:cartaPescata
        })
      } else if (this.state.secondaCartaMia === "") {
        this.setState({
          immSecondaCartaMia:require("../Images/Napoletane/"+numeroCarta+".jpg"),
          secondaCartaMia:cartaPescata
        })
      } else {      // TODO: convertire in else if?
        this.setState({
          immTerzaCartaMia:require("../Images/Napoletane/"+numeroCarta+".jpg"),
          terzaCartaMia:cartaPescata
        })
      } 

      if (this.state.primaCartaAvversario === "") {
        this.setState({
          primaCartaAvversario:cartaCoperta
        })
      } else if (this.state.secondaCartaAvversario === "") {
        this.setState({
          secondaCartaAvversario:cartaCoperta
        })
      } else {      // TODO: convertire in else if?
        this.setState({
          terzaCartaAvversario:cartaCoperta
        })
      } 
    }
      

    })

    socket.off("finePartita").on("finePartita", () => {
      notify("La partita è finita")
    })

    socket.off("disconnessioneAvversario").on("disconnessioneAvversario", () => {
      notify("L'avversario si è disconnesso")
    })

    socket.off("abbandonoAvversario").on("abbandonoAvversario", () => {
      notify("L'avversario ha abbandonato la partita")
    })
  }


  randomNumberInRange(min, max) {
    // 👇️ get number between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  
  render() { 
    return (
      <>
      <div className="container text-center bg-success">   
          
      <div className="row">
        <div className="col-sm" id="SecondPlayerFirstCard" onClick={this.handleClick}>
          <img className="rounded-4" src={this.state.primaCartaAvversario} alt=""></img>
        </div>
        <div className="col-sm" id="SecondPlayerSecondCard" onClick={this.handleClick}>
          <img className="rounded-4" src={this.state.secondaCartaAvversario} alt=""></img>
        </div>
        <div className="col-sm" id="SecondPlayerThirdCard" onClick={this.handleClick}>
          <img className="rounded-4" src={this.state.terzaCartaAvversario} alt=""></img>
        </div>
        <div className="col-sm" id="SecondPlayerPoints" onClick={this.handleClick}>
          <div className="Punteggio rounded-5 bg-light">{this.state.punteggioAvversario}</div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm"><img className="rounded-4" src={cartaCoperta} id="Mazzo" style={{float: "left"}}></img></div>     
        <div className="col-sm"><img className="rounded-4" src={this.state.immBriscolaEstratta} style={{float: "left",transform: "rotate(90deg)"}}></img></div>      
        <div className="col-sm"><img className="rounded-4" src={this.state.primaCartaTavola} alt=""></img></div>
        <div className="col-sm"><img className="rounded-4" src={this.state.secondaCartaTavola} alt=""></img></div>
      </div>
      <div className="row">
        <div className="col-sm" id="FirstPlayerFirstCard" onClick={this.handleClick}>
          <img className="rounded-4" src={this.state.immPrimaCartaMia} alt="" style={{ position : "relative",bottom: 0}}></img>
        </div>
        <div className="col-sm" id="FirstPlayerSecondCard" onClick={this.handleClick}>
          <img className="rounded-4" src={this.state.immSecondaCartaMia} alt="" style={{position : "relative",bottom : 0}}></img>
        </div>
        <div className="col-sm" id="FirstPlayerThirdCard" onClick={this.handleClick}>
          <img className="rounded-4" src={this.state.immTerzaCartaMia} alt="" style={{position : "relative",bottom : 0}}></img>
        </div>
        <div className="col-sm" id="FirstPlayerPoints" onClick={this.handleClick}>
          <div className="Punteggio rounded-5 bg-light">{this.state.punteggioMio}</div>
        </div>
      </div>
      </div>
      <ToastContainer />
    </>
    )
  }
}

