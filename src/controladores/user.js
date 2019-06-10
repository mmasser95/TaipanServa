const bcrypt = require("bcrypt-node");
const User = require("../models/user");
const auth = require("../servicios/auth");
function lougin(data, s) {
  let username = data.user;
  let pass = data.pass;
  if (!username || !pass) return s.emit("isLoggedIn", { token: false });
  User.findOne({ username }, "_id username pass", (err, user) => {
    if (err) return s.emit("isLoggedIn", { token: false });
    let passDB = user.pass;
    bcrypt.compare(pass, passDB, (err, result) => {
      if (err) return s.emit("isLoggedIn", { token: false });
      if (!result) return s.emit("isLoggedIn", { token: false });
      let r = auth.createToken(user._id);
      if (r) {
        return s.emit("isLoggedIn", { token: r, username: data.user });
      }
    });
  });
}

function usernames(userlist, username, socketId) {
  if (
    userlist
      .map(e => {
        return e._id;
      })
      .indexOf(username) == -1
  ) {
    userlist.append({ username, socketId });
    return userlist;
  }
  return false;
}

module.exports = { lougin, usernames };
