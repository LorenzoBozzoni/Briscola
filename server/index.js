const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
const mysql = require('mysql');
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
        const insertResult = collection.insertOne({user: email, password: password});      // tolto async --> AGGIUNGERE HASH!
        if (insertResult)
          socket.emit("accessOutcome", true);
        else 
          socket.emit("accessOutcome", false);

        //console.log('Inserted documents =>', insertResult);
      }else{
        // login
        const selectResult = await collection.findOne({user: email, password: password});
        console.log("selectResult: ", selectResult)
        if (selectResult)
          socket.emit("accessOutcome", true);
        else 
          socket.emit("accessOutcome", false);   
      }
    })

    /*
    socket.on("startGame", (mode) => {

      switch (mode) {
        case "friend": friend.push(socket.id); break;
        case "single": {
          single.push(socket.id);
          var tmp = new Partita(socket.id, "server")
          partite.push(tmp)
          //console.log({tmp})
          
          console.log(tmp.getMazzo().getMano())
          socket.emit("partitaIniziata", tmp, tmp.getMazzo().getMano())
          break;
          
        }
        case "multi": multi.push(socket.id); break;
      }

      
    })
    */

    socket.on("disconnect", () =>{
      console.log("user disconnected ", socket.id);
    })
})



server.listen(3001, () => {
    console.log("Server listening on port 3001...");
});


// Database
const connection = mysql.createConnection({
  host: '127.0.0.1',  // non bisogna mettere la porta
  user: 'root',
  password: 'root',
  database: 'sailingclub'
});

connection.connect((err) => {
  if (err) console.log(err);
  console.log('Connected!');
});

/*
connection.query('SELECT * FROM boats', function(err, rows, fields) 
{
  if (err) throw err;
  console.log(rows[1]);
});
*/