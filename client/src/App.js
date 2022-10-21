import logo from './logo.svg';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import {Navbar} from './components/Navbar.js';
import {GameField} from './components/GameField.js'
import {InitialPage}  from './components/InitialPage.js';
import {LoginPage}  from './components/LoginPage.js';
import {Routes, Route} from 'react-router-dom';

// Dettagli transport non so se sono corretti, sono per l'admin panel teoricamente ma non va


function App() {
  // TODO: fare in modo che le pagine non iniziali non siano raggiungibili tramire url nel browser
  return (
    <>
    <Routes> 
      <Route path="/" element={<LoginPage/>} />
      <Route path="selectGame" element={<InitialPage/>} />
      <Route path="selectGame/partita" element={<GameField/>}  />
    </Routes>
  </>
  );
}

export default App;


