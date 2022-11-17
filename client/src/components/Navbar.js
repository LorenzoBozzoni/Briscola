import React, {Component} from 'react'
import 'bootstrap/dist/css/bootstrap.css';

export class Navbar extends Component {
  state = {
    id:this.props.PlayerUsername
  }

  // Funzione asincona per le richieste HTTP 
  async pageRequest(page){
    var response = await fetch(page, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
    });

    // Visualizzazione risposta (quando pronta) in arrivo dopo richiesta HTTP
    const text = await response.text()
    window.alert(text)
  }


  render (){
    return (
  <>
  <nav className="navbar navbar-expand-lg bg-light">
    <div className="container-fluid">
      <a className="navbar-brand" href="">Briscola</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarScroll">
        <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" >
          <li className="nav-item">
            <a className="nav-link active" aria-current="page" target="_blank" role="button"/*href="https://it.wikipedia.org/wiki/Briscola#Origine_ed_etimologia"*/ onClick={() => {this.pageRequest("/StoriaBriscola")}}
            >Storia del gioco</a>
          </li>
          <li className="nav-item">
            <a className="nav-link active" aria-current="page" target="_blank" role="button" onClick={() => {this.pageRequest("/PuntiBriscola")}}
            >Valore delle carte</a>
          </li>
          <li className="nav-item">
            <a className="nav-link active" aria-current="page" target="_blank" role="button"/*href="https://it.wikipedia.org/wiki/Briscola#Regole"*/ onClick={() => {this.pageRequest("/RegoleBriscola")}}
            >Regole</a>
          </li>
          <li className="nav-item">
            <a className="nav-link active" aria-current="page" target="_blank">Il tuo username è:</a> 
          </li>
          <li>
            <a className="nav-link" style={{float:"right"}}>{this.props.PlayerUsername}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  </>
    )
  }
}


