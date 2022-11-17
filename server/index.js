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

// Dichiarazione Cross-Origin-Resource-Sharing
app.use(cors({origin: ["https://admin.socket.io/", "http://localhost:3000"]}));
app.disable('etag');

// Connection string per Mongodb Atlas database e connessione
const dbURI = "mongodb+srv://lorebozzo:-4J2Rht4QYq6S!!@cluster0.3wfvfel.mongodb.net/?retryWrites=true&w=majority"
const mongoClient = new MongoClient(dbURI);
async function run() {
  await mongoClient.connect();
  console.log("[info] Siamo connessi a MongoDB Atlas!");
}
run().catch(err => console.log("Errore connessione: " + err))

// Creazione server HTTP
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
var multi = [];
var friend = [];

// Partite che si stanno giocando
var partite = [];

// Utenti attivi con i rispettivi socket id
var users = [];

// Esito login dal database
var outcome;

// Selezione del database
const db = mongoClient.db("Briscola");
const collection = db.collection('Briscola');

// APERTURA CONNESSIONE CON IL CLIENT
io.on("connection", (socket) =>{
  outcome = false;

  // RICHIESTA CLIENT PER LOGIN/SIGNUP
  socket.on("access", async (accessMode, email, password) => {      // async qua per aspettare risultato query mongodb
    console.log("[info] Modalità di accesso: ",accessMode,"\nemail: ",email,"\npassword: ",password)
    if (accessMode === "signup"){
      const selectResult = await collection.findOne({user: email});
      console.log("[info] Risultato select MongoDb: ", selectResult)
      if (selectResult == null) {     // se riesce l'inserimento e l'username non è già usato beme
        const insertResult = collection.insertOne({user: email, password: password});   
        if (insertResult) {
          outcome = true;
          users.push({"user":email, "id":socket.id})
        }else{
          console.log("[info] Signup non andato a buon fine: insert non corretta")
        }
      } else {
        console.log("[info] Signup non andato a buon fine: email già usata")
        outcome = false;
      }
    }else{
      // login
      const selectResult = await collection.findOne({user: email, password: password});       // Controlliamo che non ci sia già un utenete con lo stesso username
      console.log("[info] Risultato select MongoDb: ", selectResult)
      if (selectResult != null){ 
        outcome = true; 
        console.log("[info] Esito login true")
        users.push({"user":email, "id":socket.id})
      } else { 
        outcome = false;
        console.log("[info] Esito login falso")   
      }
    }
    socket.emit("accessOutcome", outcome, email)   
  })

  // SELEZIONE TIPO DI PARTITA CHE SI VUOLE FARE
  socket.on("gameTypeSelected", (mode, avversario) => {
    switch (mode) {
      case "friend": {
        friend.push(socket.id); 
        var idAvversario = getIdFromUser(users,avversario)
        if (idAvversario !== null && idAvversario !== socket.id){
          io.to(idAvversario).emit("RichiestaInizioPartita", getUserFromId(users,socket.id))     // Mandiamo la richiesta all'amico
        }
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
          if (socket.id !== avversario) {
          var tmp = new Partita(socket.id, avversario)    // Creiamo subito una nuova partita con questi due avversari
            partite.push(tmp)

            io.to(socket.id).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()), JSON.stringify(tmp.getBriscolaEstratta()))
            io.to(avversario).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()), JSON.stringify(tmp.getBriscolaEstratta()))       
          }   
        }
        break;
      }
      default: io.to(socket.id).emit("error")
    }
  })  


  socket.on("RispostaPartitaAmico", (risposta, userAmico) => {
    var idAmico = getIdFromUser(users, userAmico)
    if (idAmico !== null){
      if (risposta === "si"){
        // La partita può iniziare
        var tmp = new Partita(socket.id,idAmico)    // Creiamo subito una nuova partita con questi due avversari
        partite.push(tmp)
  
        io.to(socket.id).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()), JSON.stringify(tmp.getBriscolaEstratta()))
        io.to(idAmico).emit("partitaIniziata", JSON.stringify(tmp), JSON.stringify(tmp.getMazzo().getMano()), JSON.stringify(tmp.getBriscolaEstratta()))
      }else{
        // Si comunica all'amico che non vuole giocare
        io.to(idAmico).emit("richiestaAmicoRifiutata")
      }
    }else{
      console.log("[err] IdAmico non trovato")
    }

  })

  socket.on("cartaGiocataReq", (idPartita, cartaGiocata) => {
    // carta giocata è una stringa contentente un json. Deve essere convertita con JSON.parse per poter accedere alle sue proprietà
    cartaGiocata = JSON.parse(cartaGiocata)
    
    // Scorri tutte le partite in corso 
    for (let i = 0; i < partite.length; i++) {
      if ((partite[i].getIdPartita()).toString() === idPartita){
        
        var tmpCarta = new Carta(cartaGiocata.Valore, cartaGiocata.Numero, cartaGiocata.Seme, cartaGiocata.IsBriscola, cartaGiocata.ImagePath)

        if (partite[i].getCartaInTavola() === null && socket.id === partite[i].getChiInizia()){         // Prima carta del turno
          partite[i].setCartaInTavola(tmpCarta)
          io.to(socket.id).emit("cartaGiocataRes", true, JSON.stringify(cartaGiocata),1)          // esito richiesta carta giocata
          io.to(partite[i].getAvversario(socket.id)).emit("cartaGiocataAvversario", cartaGiocata.ImagePath,1)             // per aggiornamento grafica
        } else if (partite[i].getCartaInTavola() != null && socket.id != partite[i].getChiInizia()) {       // Seconda carta del turno
          io.to(socket.id).emit("cartaGiocataRes", true, JSON.stringify(cartaGiocata),2)    // Stringify serve per fare ritornare come era quando passata come parametro
          io.to(partite[i].getAvversario(socket.id)).emit("cartaGiocataAvversario", cartaGiocata.ImagePath, 2)       // per aggiornamento grafica
         
          // Calcola vincitore
          var primaCartaGiocata = partite[i].getCartaInTavola()
          var secondaCartaGiocata = tmpCarta
          var idVincitoreMano = "";

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
            console.log("[err] Errore try catch gestione mani, errore: " + err)
            io.to(socket.id).emit("cartaGiocataRes", false)
          }
          // Fare visualizzare la prima e la seconda carta giocata

          // Setta nuovo ChiGioca
          partite[i].setChiInizia(idVincitoreMano)
          // Calcola punteggio
          if (partite[i].getIdGiocatore1() === idVincitoreMano){
            partite[i].addToPunteggio1(primaCartaGiocata.getValore() + secondaCartaGiocata.getValore())
          }else{
            partite[i].addToPunteggio2(primaCartaGiocata.getValore() + secondaCartaGiocata.getValore())
          }

          console.log("Numero di carte rimanenti ---------------------------> ",partite[i].getCarteRimanenti())

          // Ritorno messaggio e aggiornamento + carta pescata automaticamente per entrambi i giocatori (in ordine)
          if (partite[i].getCarteRimanenti() === 1){
            // Il secondo giocatore pesca la carta sotto
            var cartaRimanente = partite[i].pescaCarta()
            io.to(socket.id).emit("fineMano", JSON.stringify(partite[i]), JSON.stringify(cartaRimanente))
            io.to(partite[i].getAvversario(socket.id)).emit("fineMano",  JSON.stringify(partite[i]), JSON.stringify(partite[i].getBriscolaEstratta()))  
          }else if (partite[i].getCarteRimanenti() === 0){
            // La partita è finita!
            if (partite[i].getManiFinali() === 1){
              var vincitore;
              if (partite[i].getPunteggio1 > partite[i].getPunteggio2){
                vincitore = partite[i].getGiocatore1()
              }else{
                vincitore = partite[i].getGiocatore2()
              }
              io.to(socket.id).emit("finePartita", vincitore)
              io.to(partite[i].getAvversario(socket.id)).emit("finePartita", vincitore)

              // Gestione di fine partita
              partite.splice(i, 1)   // Rimozione della partita dalla lista delle partite in corso
              break
            } else {
              partite[i].decrementManiFinali()
              io.to(socket.id).emit("fineMano", JSON.stringify(partite[i]), JSON.stringify(partite[i].pescaCarta()))
              io.to(partite[i].getAvversario(socket.id)).emit("fineMano",  JSON.stringify(partite[i]), JSON.stringify(partite[i].pescaCarta()))  //TODO: sostituire con pop()
            }
              
          }else {
            io.to(socket.id).emit("fineMano", JSON.stringify(partite[i]), JSON.stringify(partite[i].pescaCarta()))
            io.to(partite[i].getAvversario(socket.id)).emit("fineMano",  JSON.stringify(partite[i]), JSON.stringify(partite[i].pescaCarta()))  //TODO: sostituire con pop()
          }
          // Svuota CartaInTavola
          partite[i].setCartaInTavola(null)
          
        }else{
          io.to(socket.id).emit("cartaGiocataRes", false)
        }

      }else{
        console.log("[err] Errore mismatch partita")
      }
    }
  })

  // Metodo per aggiornare gli id delle socket dopo disconnessione temporanea utente
  socket.on("AggiornaID",(username) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].user === username){
        users[i].id = socket.id
      } 
    }
    console.log("[info] Id di " + username + " aggiornato, nuovo id: " + socket.id)
  })


  // In caso di chiusura della pagina 
  socket.on("disconnect", () =>{
    uscita(socket.id, true)
  })

  // In caso di uscita dalla partita (tasto back)
  socket.on("abbandonaPartita", () => {
    uscita(socket.id, false)
  })
  
})

// Richiesta HTTP per visualizzare regole briscola 
app.get('/PuntiBriscola', (req, res) => {
  console.log("[info] Richiesta per punti del gioco arrivata")
  res.download("../PuntiBriscola.txt")
})

// Richiesta HTTP per visualizzare regole briscola 
app.get('/RegoleBriscola', (req, res) => {
  console.log("[info] Richiesta per regole del gioco arrivata")
  res.download("../RegoleBriscola.txt")
})

// Richiesta HTTP per visualizzare la storia del gioco della briscola
app.get('/StoriaBriscola', (req, res) => {
  console.log("[info] Richiesta per storia gioco arrivata")
  res.download("../StoriaBriscola.txt")
})

server.listen(3001, () => {
    console.log("[info] Server listening on port 3001...");
});


// Disconnesso è un valore booleano che indica se il giocatore si è disconnesso (true) o ha soltanto abbandonato la partita (false)
function uscita(id, disconnesso){
  console.log("[info] Utente disconnesso: ", id);

  // Remove from waiting room if (in it) and disconnected
if(multi.find(item => item === (id).toString)){
    multi.pop(id)
} else if(friend.find(item => item === (id).toString())){
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

  console.log("[info] Evento disconnessione avversario inviato a -> " + sendTo)


  // Chiusura robe strane
  /*
  socket.removeAllListeners('send message');
  socket.removeAllListeners('disconnect');
  io.removeAllListeners('connection');
  */
}

// Cerca nell'array users (TODO: non passare come parametro l'array) l'id e ritorna lo username associato
function getUserFromId(array, id){
  for (let index = 0; index < array.length; index++) {
    if (array[index].id === id){
      return array[index].user
    }
  }
  return null
}

// Vicecersa del precedente
function getIdFromUser(array, user){
  for (let index = 0; index < array.length; index++) {
    if (array[index].user === user){
      return array[index].id
    }
  }
  return null
}