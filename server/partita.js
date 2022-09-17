import Mazzo from './mazzo.js'

class Partita{
    constructor(IdGiocatore1, IdGiocatore2){
        this.IdPartita = Math.random()*1000;
        this.ManiRimanenti = 
        this.Punteggio1 = 0
        this.Punteggio2 = 0
        this.IdGiocatore1 = IdGiocatore1
        this.IdGiocatore2 = IdGiocatore2
        this.ChiInizia = IdGiocatore1
        this.Mazzo = new Mazzo()
    }


}