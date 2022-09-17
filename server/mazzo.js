class Carta{
    constructor(Valore, Numero, Seme, IsBriscola){
        this.Valore = Valore
        this.Numero = Numero
        this.Seme = Seme
        this.IsBriscola = IsBriscola
        //this.Immagine = PATH
    }

    getSeme() { return this.Seme }
    setIsBriscola(val) { this.IsBriscola = val } 

}

export class Mazzo {
    constructor() {
        // dovremmo passare la tipologia di carte da usare 
        this.mazzo = Array(40)     // inizializzo un array di dimensione 40
        
        let seme = ""
        let valore = 0

        for (var i = 0; i < 4; i++) {      // Per ogni seme
            switch (i) {
                case 0: seme = "Bastoni"
                case 1: seme = "Denari"
                case 2: seme = "Coppe"
                case 3: seme = "Spade"
            }
            for (var j = 1; j < 11; j++) {
                switch (j){
                    case 1: valore = 11     // asso
                    case 3: valore = 10     // tre
                    case 8: valore = 2      // fante
                    case 9: valore = 3      // cavallo
                    case 10: valore = 4     // re 
                    default: valore = 0
                }
                this.mazzo[i] = new Carta(valore, j, seme, false)       // di default non impostiamo una briscola
            }
        }
    }
    
    shuffle(array) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }

    pop() {
        return this.mazzo.pop()
    }

    impostaBriscola(briscola) {
        for (var i = 0; i < this.mazzo.length(); i++) {
            if (this.mazzo[i].getSeme() == briscola){ù
                this.mazzo[i].setIsBriscola(true)
            }
        }
    }
    
}