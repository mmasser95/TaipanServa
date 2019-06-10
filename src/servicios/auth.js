const jwt = require("jwt-simple");
const moment = require("moment");
const config = require("../config");

function createToken(userId) {
  let payload = {
    sub: userId,
    iat: moment().unix(),
    exp: moment()
      .add(14, "days")
      .unix()
  };
  return jwt.encode(payload, config.SECRET);
}

function auth(token) {
  let rs = jwt.decode(token, config.SECRET);
  if (rs.exp <= moment().unix()) {
    return false;
  }
  return rs.sub;
}

module.exports = { createToken, auth };
