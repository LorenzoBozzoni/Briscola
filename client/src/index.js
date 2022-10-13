import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';
import { io, Socket } from 'socket.io-client'

// Dettagli transport non so se sono corretti, sono per l'admin panel teoricamente ma non va
const socket = io('http://localhost:3001',{transports: ['websocket', 'polling', 'flashsocket'], "credentials":true})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
);

//var idPartita = 0;

/*
  socket.on('connect', () => {
    window.alert(`Client connesso con id ${socket.id}`)
    socket.on('partitaIniziata',(partita, mano) => {
      idPartita = partita.IdPartita;      // memorizziamo nel client l'id della partita
      window.alert(idPartita)
      
      /*
      for (i = 0; i < partita.Mazzo.length; i++){
        
      }
      // manca chiusura commento multiline
    })
  })
*/


export function cartaGiocata(id){
  window.alert(id);
  if (socket.connected){    // verifichiamo di essere connessi prima di inviare il click
    socket.emit("cartaGiocata", )
  }
}


export function startGame(modalità){
  socket.emit('startGame', modalità);
  // Nell'attesa della risposta (evento socket partitaIniziata) si potrebbe rendere visibile il simbolo di attesa
}


// FUNZIONE PER MANDARE RICHIESTA LOGIN/SIGNUP AL SERVER
export function access(accessType){
  // accessType può essere "login" o "signup"
  window.alert("Nel metodo di accesso");
  //var spinner = document.getElementById("spinner").setAttribute("visibility","visible");
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


// PRELEVA IL RISULTATO DEL LOGIN/SIGNUP
socket.on('accessOutcome', (accessOutcome) => {
  window.alert("esito: " + accessOutcome);
  window.alert("Ricezione evento accesso: " + accessOutcome);
  // TODO: capire come gestire lo spinner qua sotto per animazione attesa login/signup
  //spinner.setAttribute("visiblity","hidden");      // non si aggiorna lo stile della pagina così quindi non funziona
  if (!accessOutcome) {
    //document.getElementById("").setAttribute()
    window.alert("Autenticazione fallita");
  } else {
    document.location.href = document.location + "selectGame"; // ci si sposta nella pagina per selezionare il tipo di partita
    window.alert("Autenticazione riuscita");
  }
})



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
