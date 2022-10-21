import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';
import {socket} from "./components/LoginPage.js"
/*
import { io, Socket } from 'socket.io-client'

// Dettagli transport non so se sono corretti, sono per l'admin panel teoricamente ma non va
export const socket = io('http://localhost:3001',{transports: ['websocket', 'polling', 'flashsocket'], "credentials":true})
*/

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











socket.on("error", () => {
  window.alert("Something wen wrong!")
})




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
