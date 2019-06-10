const express = require("express");
const config = require("./config");
const app = express()
  .use((req, res) => res.sendFile(__dirname + "/index.html"))
  .listen(config.PORT, () => console.log(`Listening on ${config.PORT}`));
const io = require("socket.io")(app);
const cors = require("cors");
const mongoose = require("mongoose");
const userCtrl = require("./controladores/user");
/*let User = require("./models/user");*/
mongoose.connect(config.DB, { useNewUrlParser: true }, (err, res) => {
  /*let ads = new User({ username: "admin2", pass: "admin2" });
  ads.save((err, saved) => {
    return saved;
  });*/
  //-------------------------INIT
  if (err) return console.log(`Error al conectar a la base de datos ${err}`);
  let usernames = [];

  /*app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
  });*/
  //--------------------SOCKET INIT
  io.on("connection", socket => {
    socket.emit("hello", { hello: "What is your username?" });
    //---------------------LOGIN
    socket.on("login", function(req) {
      userCtrl.lougin(req, socket);
    });
    //--------------------CONEXIÓN
    socket.on("username", function(res) {
      let user = res.username;
      if (
        usernames
          .map(function(e) {
            return e.username;
          })
          .indexOf(user) === -1
      ) {
        usernames.push({ username: res.username, id: socket.id });
        io.emit("usuarioNuevo", { users: usernames });
      } else {
        socket.emit("login", { message: "Este usuario ya existe" });
      }
    });

    //---------------------ENVIAR MENSAJE

    socket.on("enviarMensaje", function(res) {
      let msg = res.msg;
      let socketId = res.socketId;
      console.log(`Mensaje ${msg} enviado a ${socketId}`);
      io.to(`${socketId}`).emit("mensajeNuevo", { from: socket.id, msg });
    });

    //---------------------DESCONEXIÓN
    socket.on("disconnect", function(res) {
      let pos = usernames
        .map(function(e) {
          return e.id;
        })
        .indexOf(socket.id);
      if (pos !== -1) usernames.splice(pos, 1);
      io.emit("usuarioNuevo", { users: usernames });
    });
  });
});
