const Carta = require('./carta.js');
const Mazzo = require('./mazzo.js')

class Partita{
    constructor(IdGiocatore1, IdGiocatore2){
        this.IdPartita = Math.floor(Math.random()*1000);
        this.Mazzo = new Mazzo()
        this.ManiRimanenti = Math.floor(this.Mazzo.carteRimanenti() / 2);     // Numero carte diviso il numero di giocatori
        this.Punteggio1 = 0
        this.Punteggio2 = 0
        this.IdGiocatore1 = IdGiocatore1
        this.IdGiocatore2 = IdGiocatore2
        this.ChiInizia = IdGiocatore1
        this.CartaInTavola = null;    
    }

    // Ritorna il mazzo utilizzato per una partita
    getMazzo() {
        return this.Mazzo;
    }

    // Ritorna il numero di mani ancora da giocare
    getManiRimanenti() {
        return this.ManiRimanenti;
    }

    // Ritorna l'id del giocatore1
    getIdGiocatore1() {
        return this.IdGiocatore1;
    }

    // Ritorna l'id del giocatore2
    getIdGiocatore2() {
        return this.IdGiocatore2;
    }

    // Ritorna l'id della partita
    getIdPartita() {
        return this.IdPartita;
    }

    // Ritorna la carta che è stata giocata e che quindi è in tavola se presente, altrimenti null
    getCartaInTavola() {
        return this.Mano;
    }

    // Ritorna l'id del giocatore che deve iniziare la mano
    getChiInizia() {
        return this.ChiInizia;
    }

    // Dato l'id di un giocatore, ritorna l'id del suo avversario
    getAvversario(idGiocatore){
        var toReturn = "";
        if (idGiocatore === this.getIdGiocatore1()){
            toReturn = this.getIdGiocatore2()
        }else{
            toReturn = this.getIdGiocatore1()
        }
        return toReturn;
    }

    // Carte giocate durante la mano, pos può essere 0 o 1 in base a quando è stata giocata la carta
    setCartaInTavola(value) {
        this.CartaInTavola = value;  
        console.log("CARTAINTAVOLA: " + this.CartaInTavola.getIsBriscola() + " " + this.CartaInTavola.getImagePath() + " " + this.CartaInTavola.getSeme() + " " + this.CartaInTavola.getValore())
    }

    // Imposta l'id del giocatore che deve iniziare il turno successivo
    setChiInizia(idGiocatore) {
        this.ChiInizia = idGiocatore;
    }
}

module.exports = Partita