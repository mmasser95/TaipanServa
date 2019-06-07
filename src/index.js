const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");
let usernames = [];
server.listen(8080);
app.use(cors);
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socket => {
  socket.emit("hello", { hello: "What is your username?" });
  socket.on("login", function(req) {
    let user = req.user;
    let pass = req.pass;
  });
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
      socket.emit("login", { message: "ok" });
      io.emit("usuarioNuevo", { users: usernames });
    } else {
      socket.emit("login", { message: "Este usuario ya existe" });
    }
  });
  socket.on("enviar", function(res) {
    socket.broadcast.emit("mensajeNuevo", {
      message: res.message,
      username: res.username
    });
  });
  socket.on("enviarPrivado", function(res) {
    let pos = usernames
      .map(function(e) {
        return e.username;
      })
      .indexOf(res.to);
    if (pos === -1) return false;
    let socketID = usernames[pos].id;
    io.to(`${socketID}`).emit("mensajeNuevoPrivado", {
      message: res.message,
      username: res.username
    });
  });
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
