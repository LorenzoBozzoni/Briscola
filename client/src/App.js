import logo from './logo.svg';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import {Navbar} from './components/Navbar.js';
import {GameField} from './components/GameField.js'
import {InitialPage}  from './components/InitialPage.js';
import {LoginPage}  from './components/LoginPage.js';
import {Routes, Route} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Dettagli transport non so se sono corretti, sono per l'admin panel teoricamente ma non va

export const notify = (message) => toast(message);

function App() {
  // TODO: fare in modo che le pagine non iniziali non siano raggiungibili tramire url nel browser
  return (
    <>
    <Routes> 
      <Route path="/" element={<LoginPage/>} />
      <Route path="selectGame" element={<InitialPage/>} />
      <Route path="selectGame/Partita" element={<GameField/>}  />
    </Routes>
    <div style={{height:"0px"}}>
        <ToastContainer/>
    </div>
  </>
  );
}

export default App;


