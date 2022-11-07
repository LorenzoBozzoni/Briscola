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
    console.log("accessMode: ",accessMode,"\nemail: ",email,"\npassword: ",password)
    if (accessMode === "signup"){
      const selectResult = await collection.findOne({user: email});
      const insertResult = collection.insertOne({user: email, password: password});      // tolto async --> AGGIUNGERE HASH!
      if (insertResult && selectResult == null) {     // se riesce l'inserimento e l'username non è già usato beme
        outcome = true;
        users.push({"user":email, "id":socket.id})
      } else {
        outcome = false;
      }
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
    socket.emit("accessOutcome", outcome)   // TODO: mettere io.to() ?
  })

  // SELEZIONE TIPO DI PARTITA CHE SI VUOLE FARE
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
        io.to(socket.id).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()), JSON.stringify(tmp.getBriscolaEstratta()))
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
          console.log("\nSocket.id: " + socket.id + " Type: " + typeof(socket.id))
          console.log("\nSocketAvversario: " + avversario + " Type: " + typeof(avversario))
          console.log(tmp.getMazzo().getMano())

          io.to(socket.id).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()), JSON.stringify(tmp.getBriscolaEstratta()))
          io.to(avversario).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()), JSON.stringify(tmp.getBriscolaEstratta()))          
        }
        break;
      }
      default: socket.to(socket.id).emit("error")
    }
  })  

  socket.on("cartaGiocataReq", (idPartita, cartaGiocata) => {
    // carta giocata è una stringa contentente un json. Deve essere convertita con JSON.parse per poter accedere alle sue proprietà
    cartaGiocata = JSON.parse(cartaGiocata)
    
    // Scorri tutte le partite in corso 
    for (let i = 0; i < partite.length; i++) {
      if ((partite[i].getIdPartita()).toString() === idPartita){
        console.log("Partita trovata")
        
        var tmpCarta = new Carta(cartaGiocata.Valore, cartaGiocata.Numero, cartaGiocata.Seme, cartaGiocata.IsBriscola, cartaGiocata.ImagePath)
        //console.log("TMPCARTA: " + tmpCarta.getIsBriscola() + " " + tmpCarta.getImagePath() + " " + tmpCarta.getSeme() + " " + tmpCarta.getValore())

        console.log("partite[i].getCartaInTavola() --> " + partite[i].getCartaInTavola() + " tipo --> " + typeof(partite[i].getCartaInTavola()))
        console.log("idGiocatore (socket.id) --> " + socket.id + " tipo --> " + typeof(socket.id))
        console.log("partite[i].getChiInizia() --> " + partite[i].getChiInizia() + " tipo --> " + typeof(partite[i].getChiInizia()))

        if (partite[i].getCartaInTavola() === null && socket.id === partite[i].getChiInizia()){         // Prima carta del turno
          console.log("PRIMA CARTA IN TAVOLA GIOCATA")
          partite[i].setCartaInTavola(tmpCarta)
          console.log("PARTITE["+i+"].getCartaInTavola --> ", partite[i].getCartaInTavola())
          io.to(socket.id).emit("cartaGiocataRes", true, JSON.stringify(cartaGiocata),1)          // esito richiesta carta giocata
          io.to(partite[i].getAvversario(socket.id)).emit("cartaGiocataAvversario", cartaGiocata.ImagePath,1)             // per aggiornamento grafica
          console.log("Risposta richiesta carta giocata inviata")
        } else if (partite[i].getCartaInTavola() != null && socket.id != partite[i].getChiInizia()) {       // Seconda carta del turno
          console.log("SECONDA CARTA IN TAVOLA GIOCATA")
          io.to(socket.id).emit("cartaGiocataRes", true, JSON.stringify(cartaGiocata),2)    // Stringify serve per fare ritornare come era quando passata come parametro
          io.to(partite[i].getAvversario(socket.id)).emit("cartaGiocataAvversario", cartaGiocata.ImagePath, 2)       // per aggiornamento grafica
         
          // Calcola vincitore
          var primaCartaGiocata = partite[i].getCartaInTavola()
          var secondaCartaGiocata = tmpCarta
          var idVincitoreMano = "";

          console.log("VALORE ---------> ",primaCartaGiocata.getValore())

          try{
            if (primaCartaGiocata.getIsBriscola() && secondaCartaGiocata.getIsBriscola()){
              // Entrambe le carte sono briscola, vince quella di valore maggiore
              if (primaCartaGiocata.getValore() === secondaCartaGiocata.getValore()){
                if (primaCartaGiocata.getNumero() > secondaCartaGiocata.getNumero()) {
                  idVincitoreMano = partite[i].getAvversario(socket.id)
                } else {
                  idVincitoreMano = socket.id
                }
              }else if (primaCartaGiocata.getValore() > secondaCartaGiocata.getValore()) {
                idVincitoreMano = partite[i].getAvversario(socket.id)
              } else {
                idVincitoreMano = socket.id
              }
            } else if (!primaCartaGiocata.getIsBriscola() && secondaCartaGiocata.getIsBriscola()) {
              // Solo la seconda è briscola, vince la seconda
              idVincitoreMano = socket.id
              //partite[i].setChiInizia(socket.id)
            } else if (primaCartaGiocata.getIsBriscola() && !secondaCartaGiocata.getIsBriscola()) {
              // Solo la prima è briscola, vince la prima
              idVincitoreMano = partite[i].getAvversario(socket.id)
              //partite[i].setChiInizia(partite[i].getAvversario(socket.id))
            } else {
              // Nessuna delle due è briscola, si vede se segno uguale per valore poi o per ordine se segno diverso
              if (primaCartaGiocata.getSeme() === secondaCartaGiocata.getSeme()){
                // Vince quella di valore maggiore
                if (primaCartaGiocata.getValore() > secondaCartaGiocata.getValore()){
                  idVincitoreMano = partite[i].getAvversario(socket.id)
                  //partite[i].setChiInizia(partite[i].getAvversario(socket.id))     // Il turno successivo è iniziato dall'avversario del giocatore nel metodo qua 
                } else{
                  idVincitoreMano = socket.id
                  //partite[i].setChiInizia(socket.id)
                }
              } else {
                // Vince la prima giocata
                idVincitoreMano = partite[i].getAvversario(socket.id)
                //partite[i].setChiInizia(partite[i].getAvversario(socket.id))
              }  
            }
          }catch(err){
            console.log("ERRORE TRY CATCH: " + err)
            console.log("Prima carta giocata: " + primaCartaGiocata)
            console.log("Seconda carta giocata: " + secondaCartaGiocata)
            io.to(socket.id).emit("cartaGiocataRes", false)
          }

          console.log("DOPO CATCH")

          // Fare visualizzare la prima e la seconda carta giocata

          // Setta nuovo ChiGioca
          console.log("idvincitoremano --> ",idVincitoreMano)
          partite[i].setChiInizia(idVincitoreMano)
          // Calcola punteggio
          if (partite[i].getIdGiocatore1() === idVincitoreMano){
            partite[i].addToPunteggio1(primaCartaGiocata.getValore() + secondaCartaGiocata.getValore())
          }else{
            partite[i].addToPunteggio2(primaCartaGiocata.getValore() + secondaCartaGiocata.getValore())
          }

          //partite[i].updateNumeroManiRimanenti()
          //console.log("Numero di carte rimanenti ---------------------------> ",partite[i].getMazzo().getCarteRimanenti())
          console.log("Numero di carte rimanenti ---------------------------> ",partite[i].getCarteRimanenti())

          // Ritorno messaggio e aggiornamento + carta pescata automaticamente per entrambi i giocatori (in ordine)
          if (partite[i].getCarteRimanenti() === 1){
            // Il secondo giocatore pesca la carta sotto
            var cartaRimanente = partite[i].pescaCarta()
            console.log("Carta rimanente nel mazzo " + JSON.stringify(cartaRimanente))
            io.to(socket.id).emit("fineMano", JSON.stringify(partite[i]), JSON.stringify(cartaRimanente))
            io.to(partite[i].getAvversario(socket.id)).emit("fineMano",  JSON.stringify(partite[i]), JSON.stringify(partite[i].getBriscolaEstratta()))  
          }else if (partite[i].getCarteRimanenti() === 0){
            // La partita è finita!


            io.to(socket.id).emit("finePartita")
            io.to(partite[i].getAvversario(socket.id)).emit("finePartita")  
          }else {
            io.to(socket.id).emit("fineMano", JSON.stringify(partite[i]), JSON.stringify(partite[i].pescaCarta()))
            io.to(partite[i].getAvversario(socket.id)).emit("fineMano",  JSON.stringify(partite[i]), JSON.stringify(partite[i].pescaCarta()))  
          }
          // Svuota CartaInTavola
          partite[i].setCartaInTavola(null)

          

          
        }else{
          io.to(socket.id).emit("cartaGiocataRes", false)
        }

      }else{
        console.log("ERROR: IdPartita mismatch")
      }
    }
  })




  // PER LA DISCONNESSIONE
  // TODO: non funziona, sostituire socket.to() con io.to()
  socket.on("disconnect", () =>{
    uscita(socket.id, true)
  })

  socket.on("abbandonaPartita", () => {
    uscita(socket.id, false)
  })
  
})


app.get('/ciao', (req, res) => {
  res.json({"miao":2})
})



server.listen(3001, () => {
    console.log("Server listening on port 3001...");
});


// Serve per il pannello di controllo ma non riesco a implementarlo 
// TODO: implementare pannello per controllo socket connesse al server
instrument(io, {auth: false})


// Disconnesso è un valore booleano che indica se il giocatore si è disconnesso (true) o ha soltanto abbandonato la partita (false)
function uscita(id, disconnesso){
  console.log("user disconnected ", id);

  // Remove from waiting room if (in it) and disconnected
  if(single.find(item => item === (id).toString())){
    single.pop(id)
  } else if(multi.find(item => item === (id).toString())){
      multi.pop(id)
  } else if(single.find(item => item === (id).toString())){
    friend.pop(id)
  }

  var sendTo = ""
  // Remove from match 
  for (let i = 0; i < partite.length; i++) {
    if (partite[i].getIdGiocatore1() === id){
      sendTo = partite[i].getIdGiocatore2()
    } else if (partite[i].getIdGiocatore2() === id){
      sendTo = partite[i].getIdGiocatore1()
    }
  }

  if (disconnesso){
    io.to(sendTo).emit("disconnessioneAvversario")
  }else{
    io.to(sendTo).emit("abbandonoAvversario")
  }

  console.log("Evento disconnessione avversario inviato a -> " + sendTo)


  // Chiusura robe strane
  /*
  socket.removeAllListeners('send message');
  socket.removeAllListeners('disconnect');
  io.removeAllListeners('connection');
  */
}