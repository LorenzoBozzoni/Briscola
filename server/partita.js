const Mazzo = require('./mazzo.js')

class Partita{
    constructor(IdGiocatore1, IdGiocatore2){
        this.IdPartita = Math.floor(Math.random()*1000);
        this.Mazzo = new Mazzo()
        this.ManiRimanenti = this.Mazzo.carteRimanenti() / 2;     // Numero carte diviso il numero di giocatori
        this.Punteggio1 = 0
        this.Punteggio2 = 0
        this.IdGiocatore1 = IdGiocatore1
        this.IdGiocatore2 = IdGiocatore2
        this.ChiInizia = IdGiocatore1
        
    }

    getMazzo() {
        return this.Mazzo;
    }

    getManiRimanenti() {
        return this.ManiRimanenti;
    }

    getIdGiocatore1() {
        return this.IdGiocatore1;
    }

    getIdGiocatore2() {
        return this.IdGiocatore2;
    }

    getIdPartita() {
        return this.IdPartita;
    }
}

module.exports = Partita