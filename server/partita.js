const Carta = require('./carta.js');
const Mazzo = require('./mazzo.js')

function mischia(array) {
var tmpSwitch;
var randomIndex = 0;

//console.log("ARRAY PRIMA DEL CICLO " + JSON.parse(array) + " LUNGHEZZA: " + typeof(array))
console.log("ARRAY PRIMA DEL CICLO: " + array)

for (let i = 0; i < array.length; i++) {
    tmpSwitch = array[i]
    randomIndex = Math.floor(Math.random() * array.length)
    console.log("array[",i,"]: ", array[i])
    console.log("array[",randomIndex,"]: ", array[randomIndex])
    array[i] = array[randomIndex]
    array[randomIndex] = tmpSwitch
    console.log("array[",i,"]: ", array[i])
    console.log("array[",randomIndex,"]: ", array[randomIndex])
}
return array;
}
  

class Partita{
    constructor(IdGiocatore1, IdGiocatore2){
        this.IdPartita = Math.floor(Math.random()*1000);
        this.Mazzo = mischia(new Mazzo())
        this.CarteRimanenti = this.Mazzo.carteRimanenti();     // Numero carte rimanenti
        this.Punteggio1 = 0
        this.Punteggio2 = 0 
        this.IdGiocatore1 = IdGiocatore1
        this.IdGiocatore2 = IdGiocatore2
        this.ChiInizia = IdGiocatore1
        this.CartaInTavola = null;    
        this.BriscolaEstratta = this.Mazzo.pop()
        this.ManiFinali = 3
        
        this.BriscolaEstratta.setIsBriscola(true)
        this.Mazzo.impostaBriscola(this.BriscolaEstratta.getSeme())
        //this.Mazzo = this.Mazzo.mischia()
        //console.log("Mazzo nuovo", this.Mazzo)
    }

    // Ritorna il mazzo utilizzato per una partita
    getMazzo() {
        return this.Mazzo;
    }

    getCarteRimanenti(){
        this.CarteRimanenti = this.Mazzo.carteRimanenti()
        return this.Mazzo.carteRimanenti()
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
        return this.CartaInTavola;
    }

    // Ritorna l'id del giocatore che deve iniziare la mano
    getChiInizia() {
        return this.ChiInizia;
    }

    getBriscolaEstratta(){
        return this.BriscolaEstratta;
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
    }

    // Imposta l'id del giocatore che deve iniziare il turno successivo
    setChiInizia(idGiocatore) {
        this.ChiInizia = idGiocatore;
    }

    getPunteggio1() {
        return this.Punteggio1
    }

    getPunteggio2() {
        return this.Punteggio2
    }

    addToPunteggio1(valore) {
        this.Punteggio1 += valore;
    }

    addToPunteggio2(valore) {
        this.Punteggio2 += valore;
    }

    pescaCarta(){
        var estratta = this.Mazzo.pop()

        if (estratta !== undefined){
            return estratta;
        }else{
            return {};
        }
    }
    
    getManiFinali(){
        return this.ManiFinali;
    }

    decrementManiFinali() {
        this.ManiFinali -= 1;
    }

    
}

module.exports = Partita