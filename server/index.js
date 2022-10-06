const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
const Partita = require("./partita.js");
const {MongoClient} = require("mongodb");
const { stringify } = require("querystring");


app.use(cors());

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
        origin : ["http://localhost:3000","http://localhost:3001"],
        methods : ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"]    // methods accepted
    }
})

var single = [];
var multi = [];
var friend = [];
var partite = [];

const db = mongoClient.db("Briscola");
const collection = db.collection('Briscola');




io.on("connection", (socket) =>{
    console.log(socket.id);
    socket.on("access", async (accessMode, email, password) => {      // async qua per aspettare risultato query mongodb
      console.log("accessMode:",accessMode)
      console.log("email:",email)
      console.log("password:",password)
      if (accessMode === "signup"){
        const selectResult = await collection.findOne({user: email});
        const insertResult = collection.insertOne({user: email, password: password});      // tolto async --> AGGIUNGERE HASH!
        if (insertResult && selectResult == null)      // se riesce l'inserimento e l'username non è già usato beme
          socket.emit("accessOutcome", true);
        else 
          socket.emit("accessOutcome", false);

        //console.log('Inserted documents =>', insertResult);
      }else{
        // login
        const selectResult = await collection.findOne({user: email, password: password});
        console.log("selectResult: ", selectResult)
        if (selectResult != null){  
          console.log("LOGIN TRUE")
          socket.emit("accessOutcome", true);
        } else { 
          socket.emit("accessOutcome", false);
          console.log("LOGIN FALSE")   
        }
      }
    })



    socket.on("disconnect", () =>{
      console.log("user disconnected ", socket.id);
    })
})



server.listen(3001, () => {
    console.log("Server listening on port 3001...");
});



