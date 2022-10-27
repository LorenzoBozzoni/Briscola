const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
const Partita = require("./partita.js");
const Carta = require("./carta.js")
const {MongoClient} = require("mongodb");
const { stringify } = require("querystring");
const { instrument } = require("@socket.io/admin-ui"); 
const { SocketAddress } = require("net");
const { emit } = require("process");

app.use(cors({origin: ["https://admin.socket.io/", "http://localhost:3000"]}));



const dbURI = "mongodb+srv://lorebozzo:-4J2Rht4QYq6S!!@cluster0.3wfvfel.mongodb.net/?retryWrites=true&w=majority"
const mongoClient = new MongoClient(dbURI);

async function run() {
  await mongoClient.connect();
  console.log("Siamo connessi a MongoDB Atlas!");
}
run().catch(err => console.log("Errore connessione: " + err))

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : ["https://admin.socket.io/", "http://localhost:3000"],              // ["https://admin.socket.io/", "http://localhost:3000"],
        methods : ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"],    // methods accepted
        transports: ['websocket'],
        credentials : false,
        allowedHeaders: ["Access-Control-Allow-Origin"]
    }
})

// Waiting rooms per capire chi sta aspettando un avversario 
var single = [];
var multi = [];
var friend = [];

// Partite che si stanno giocando
var partite = [];

// Utenti attivi
var users = [];

// Login outcome from database
var outcome;

const db = mongoClient.db("Briscola");
const collection = db.collection('Briscola');

// APERTURA CONNESSIONE CON IL CLIENT
io.on("connection", (socket) =>{
  console.log(socket.id);
  outcome = false;

  // RICHIESTA CLIENT PER LOGIN/SIGNUP
  socket.on("access", async (accessMode, email, password) => {      // async qua per aspettare risultato query mongodb
    console.log("accessMode:",accessMode)
    console.log("email:",email)
    console.log("password:",password)
    if (accessMode === "signup"){
      const selectResult = await collection.findOne({user: email});
      const insertResult = collection.insertOne({user: email, password: password});      // tolto async --> AGGIUNGERE HASH!
      if (insertResult && selectResult == null) {     // se riesce l'inserimento e l'username non è già usato beme
        outcome = true;
        users.push({"user":email, "id":socket.id})
      } else {
        outcome = false;
      }
      //console.log('Inserted documents =>', insertResult);
    }else{
      // login
      const selectResult = await collection.findOne({user: email, password: password});
      console.log("selectResult: ", selectResult)
      if (selectResult != null){ 
        outcome = true; 
        console.log("LOGIN TRUE")
        users.push({"user":email, "id":socket.id})
      } else { 
        outcome = false;
        console.log("LOGIN FALSE")   
      }
    }
    const porcaTroia = (socket.id)
    console.log("SOCKET A CUI MANDARE ESITO: " + porcaTroia)
    socket.emit("accessOutcome", outcome)
  })

  socket.on("gameTypeSelected", (mode) => {
    switch (mode) {
      case "friend": {
        friend.push(socket.id); 
        break;
      }
      case "single": {
        single.push(socket.id);
        var tmp = new Partita(socket.id, "server")    // Creiamo subito una nuova partita con questi due avversari
        partite.push(tmp)
        console.log(JSON.stringify(partite))
        //console.log({tmp})
  
        console.log(tmp.getMazzo().getMano())
        socket.to(socket.id).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()))
        break;
      }
      case "multi": {
        if (multi.length === 0){
          // Se non c'è nessuno nella waiting room, viene inserito il giocatore stesso
          multi.push(socket.id);
        }
        else {
          // Se c'è già qualcuno nella waiting room viene associato
          
          // La partita può iniziare tra il giocatore che ha appena fatto richiesta e quello che nella waiting room aspetta da più tempo
          var avversario = multi.reverse().pop()          // Id dell'avversario
          var tmp = new Partita(socket.id, avversario)    // Creiamo subito una nuova partita con questi due avversari
          partite.push(tmp)
          console.log(JSON.stringify(partite))
          //console.log({tmp})
          console.log("Socket.id: " + socket.id + " Type: " + typeof(socket.id))
          console.log("SocketAvversario: " + avversario + " Type: " + typeof(avversario))
          console.log(tmp.getMazzo().getMano())
          
          io.to(socket.id).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()))
          io.to(avversario).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()))          
        }
        break;
      }
      default: socket.to(socket.id).emit("error")
    }
  })  

  socket.on("cartaGiocataReq", (idPartita, idGiocatore, cartaGiocata) => {
    // carta giocata è una stringa contentente un json. Deve essere convertita con JSON.parse per poter accedere alle sue proprietà
    cartaGiocata = JSON.parse(cartaGiocata)
    console.log("PARAMETRI: "+idPartita+" "+idGiocatore + " " + cartaGiocata)
    for (let i = 0; i < partite.length; i++) {
      if ((partite[i].getIdPartita()).toString() === idPartita){
        /*
        console.log("CARTA GIOCATA normale: " + cartaGiocata)
        console.log("CARTA GIOCATA parse: " + JSON.parse(cartaGiocata))
        cartaGiocata = JSON.parse(cartaGiocata)
        console.log("CARTA GIOCATA valori:\n-Valore: " + cartaGiocata.Valore + "\n-Numero: " + cartaGiocata.Numero + "\n-Seme: " + cartaGiocata.Seme + "\n-IsBriscola: " + cartaGiocata.IsBriscola + "\n-ImagePath: " + cartaGiocata.ImagePath)
        */
        var tmpCarta = new Carta(cartaGiocata.Valore, cartaGiocata.Numero, cartaGiocata.Seme, cartaGiocata.IsBriscola, cartaGiocata.ImagePath)

        console.log("TMPCARTA: " + tmpCarta.getIsBriscola() + " " + tmpCarta.getImagePath() + " " + tmpCarta.getSeme() + " " + tmpCarta.getValore())

        if (partite[i].getCartaInTavola() === null && idGiocatore === partite[i].getChiInizia()){         // Prima carta del turno
            // TODO: non sembra andare la funzione sotto, non viene settato l'oggetto 
            partite[i].setCartaInTavola(tmpCarta)
            console.log("PARTITE["+i+"].getCartaInTavola --> ", partite[i].getCartaInTavola())
            io.to(socket.id).emit("cartaGiocataRes", true, cartaGiocata)          // esito richiesta carta giocata
            console.log("Risposta richiesta carta giocata inviata")
        } else if (partite[i].getCartaInTavola != null && idGiocatore != partite[i].getChiInizia()) {       // Seconda carta del turno
            // Calcola vincitore
            var primaCartaGiocata = partite[i].getCartaInTavola()
            var secondaCartaGiocata = tmpCarta
          
            try{
                if (primaCartaGiocata.getIsBriscola() && secondaCartaGiocata.getIsBriscola()){
                  // Entrambe le carte sono briscola, vince quella di valore maggiore
                  if (primaCartaGiocata.getValore() > secondaCartaGiocata.getValore()){
                    partite[i].setChiInizia(partite[i].getAvversario(idGiocatore))     // Il turno successivo è iniziato dall'avversario del giocatore nel metodo qua 
                  }
                } else if (!primaCartaGiocata.getIsBriscola() && secondaCartaGiocata.getIsBriscola()) {
                  // Solo la seconda è briscola, vince la seconda
                  partite[i].setChiInizia(idGiocatore)
                } else if (primaCartaGiocata.getIsBriscola() && !secondaCartaGiocata.getIsBriscola()) {
                  // Solo la prima è briscola, vince la prima
                  partite[i].setChiInizia(partite[i].getAvversario(idGiocatore))
                } else {
                  // Nessuna delle due è briscola, si vede se segno uguale per valore poi o per ordine se segno diverso
                  if (primaCartaGiocata.getSegno() === secondaCartaGiocata.getSegno()){
                    // Vince quella di valore maggiore
                    if (primaCartaGiocata.getValore() > secondaCartaGiocata.getValore()){
                      partite[i].setChiInizia(partite[i].getAvversario(idGiocatore))     // Il turno successivo è iniziato dall'avversario del giocatore nel metodo qua 
                    } else{
                      partite[i].setChiInizia(idGiocatore)
                    }
                  } else {
                    // Vince la prima giocata
                    partite[i].setChiInizia(partite[i].getAvversario(idGiocatore))
                  }  
              }
            }catch(err){
              console.log("ERRORE TRY CATCH: " + err)
              console.log("Prima carta giocata: " + primaCartaGiocata)
              console.log("Seconda carta giocata: " + secondaCartaGiocata)
            }


            // Fare visualizzare la prima e la seconda carta giocata

            // Setta nuovo ChiGioca
            // Calcola punteggio
            // Ritorno messaggio e aggiornamento
            // Svuota CartaInTavola

        }else{
          socket.to(socket.id).emit("cartaGiocataRes", false)
        }

      }else{
        console.log("ERROR: IdPartita mismatch")
      }
    }
  })

  // PER LA DISCONNESSIONE
  // TODO: non funziona, sostituire socket.to() con io.to()
  socket.on("disconnect", () =>{
    console.log("user disconnected ", socket.id);

    // Remove from waiting room if (in it) and disconnected
    if(single.find(item => item === (socket.id).toString())){
      single.pop(socket.id)
    } else if(multi.find(item => item === (socket.id).toString())){
      multi.pop(socket.id)
    } else if(single.find(item => item === (socket.id).toString())){
      friend.pop(socket.id)
    }

    var sendTo = ""
    // Remove from match 
    for (let i = 0; i < partite.length; i++) {
      if (partite[i].getIdGiocatore1() === socket.id){
        sendTo = partite[i].getIdGiocatore2()
      } else if (partite[i].getIdGiocatore2() === socket.id){
        sendTo = partite[i].getIdGiocatore1()
      }
    }
    socket.to(sendTo).emit("disconnessioneAvversario")
    console.log("Evento disconnessione avversario inviato a -> " + sendTo)
  })
})


app.get('/miao', (req, res) => {
  res.sendStatus(500)
})



server.listen(3001, () => {
    console.log("Server listening on port 3001...");
});


// Serve per il pannello di controllo ma non riesco a implementarlo 
// TODO: implementare pannello per controllo socket connesse al server
instrument(io, {auth: false})

