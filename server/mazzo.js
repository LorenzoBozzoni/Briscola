const Carta = require('./carta.js')

class Mazzo {
    constructor() {
        // dovremmo passare la tipologia di carte da usare 
        this.mazzo = Array(40)     // inizializzo un array di dimensione 40
        
        var seme = ""
        var valore = 0
        var ImagePath = ""

        for (var i = 0; i < 4; i++) {      // Per ogni seme
            switch (i) {
                case 0: {
                    seme = "Denari"; 
                    break
                }
                case 1: {
                    seme = "Coppe";
                    break
                }
                case 2: {
                    seme = "Bastoni";
                    break
                }
                case 3: {
                    seme = "Spade";
                    break
                }
            }
            for (var j = 0; j < 10; j++) {
                switch (j){
                    case 0: {
                        valore = 11;     // asso
                        break
                    }
                    case 2: {
                        valore = 10;     // tre
                        break
                    } 
                    case 7: {
                        valore = 2;      // fante
                        break
                    }
                    case 8: {
                        valore = 3;      // cavallo
                        break
                    }
                    case 9: {
                        valore = 4;     // re 
                        break
                    }
                    default: {
                        valore = 0;
                        break
                    }
                }
                ImagePath = "../Images/Piacentine/"+(j+(i*10)+1) + ".jpg"
                //ImagePath = "../../Piacentine/"+(j+(i*10)) + ".jpg"
                console.log("Numero carta -> ",(j+(i*10)))
                console.log("Numero del seme -> ", j)
                console.log("Valore -> ", valore)
                console.log("Seme -> ", seme)
                console.log("ImagePath -> ", ImagePath)
                console.log("-----------------------------------")
                this.mazzo[(j+(i*10))] = new Carta(valore, j+1, seme, false, ImagePath)       // di default non impostiamo una briscola
            }
        }
        var myString = JSON.stringify(this.mazzo)
        console.log("Lunghezza array --> ",this.mazzo.length)
    }

    
    pop() {
        return this.mazzo.pop()
    }
    

    impostaBriscola(briscola) {
        for (var i = 1; i < this.mazzo.length; i++) {
            if (this.mazzo[i].Seme === briscola){
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
