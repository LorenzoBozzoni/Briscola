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
    getIsBriscola() { return this.IsBriscola}
    getValore() { return this.Valore }
    getImagePath() {return this.ImagePath}

}

module.exports = Carta