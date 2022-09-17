const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
const mysql = require('mysql');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : "http://localhost:3000",
        methods : ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"]    // methods accepted
    }
})

var single = [];
var multi = [];
var friend = [];

io.on("connection", (socket) =>{
    console.log(socket.id);

    socket.on("startGame", (mode) => {

      switch (mode) {
        case "friend": friend.push(socket.id); break;
        case "single": single.push(socket.id); break;
        case "multi": multi.push(socket.id); break;
      }
      
    })

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