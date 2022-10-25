class Carta{
    constructor(Valore, Numero, Seme, IsBriscola, ImagePath){
        this.Valore = Valore
        this.Numero = Numero
        this.Seme = Seme
        this.IsBriscola = IsBriscola
        this.ImagePath = ImagePath
    }

    getSeme() { return this.Seme }
    setIsBriscola(val) { this.IsBriscola = val } 
    getImagePath() {return this.ImagePath}

}

class Mazzo {
    constructor() {
        // dovremmo passare la tipologia di carte da usare 
        this.mazzo = Array(40)     // inizializzo un array di dimensione 40
        
        let seme = ""
        let valore = 0
        var ImagePath = ""

        for (var i = 0; i < 4; i++) {      // Per ogni seme
            switch (i) {
                case 0: 
                    seme = "Denari"; 
                case 1: 
                    seme = "Coppe";
                case 2: 
                    seme = "Bastoni";
                case 3: 
                    seme = "Spade";
            }
            for (var j = 1; j < 11; j++) {
                switch (j){
                    case 1: 
                        valore = 11;     // asso
                    case 3: 
                        valore = 10;     // tre
                    case 8: 
                        valore = 2;      // fante
                    case 9: 
                        valore = 3;      // cavallo
                    case 10: 
                        valore = 4;     // re 
                    default: 
                        valore = 0;
                }
                ImagePath = "../Images/Piacentine/"+(j+(i*10)) + ".jpg"
                this.mazzo[(j+(i*10))] = new Carta(valore, j, seme, false, ImagePath)       // di default non impostiamo una briscola
            }
        }
        let myString = JSON.stringify(this.mazzo)
        console.log(myString)
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

    carteRimanenti(){
        return this.mazzo.length
    }
    
    getMano(){
        return {"PrimaCarta":this.pop(), "SecondaCarta":this.pop(), "TerzaCarta":this.pop()}
    }
}


module.exports = Mazzo