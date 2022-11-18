import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import {Navbar} from './components/Navbar.js';
import {GameField} from './components/GameField.js'
import {InitialPage, InitialPageWithRoute}  from './components/InitialPage.js';
import {LoginPage}  from './components/LoginPage.js';
import {Routes, Route} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactSession } from 'react-client-session';
import { Helmet } from 'react-helmet';

ReactSession.setStoreType("sessionStorage");           // Selezioniamo in che modo salvare le informazioni con ReactSession
export const notify = (message) => toast(message);     // Funzione per la visualizzazione dei messaggi toast 

function App() {
  return (
    <><Helmet>
          <title>{"BriscolaJS"}</title>
      </Helmet>
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="selectGame" element={<InitialPageWithRoute/>} />
      <Route path="selectGame/Partita" element={<GameField/>}  />
    </Routes>
    <div style={{height:"0px"}}>
        <ToastContainer/>
    </div>
  </>
  );
}

export default App;


