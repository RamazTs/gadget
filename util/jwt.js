const jwt = require("jsonwebtoken");
const JWT_LIFETIME = 15 * 60;
const JWT_SECRET =  process.env.JWT_SECRET || "6b66f6d5-d103-4cc0-8578-a6c37ab4bda5";
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || "HS512";
const JWT_ARGS = [JWT_SECRET, { algorithm: JWT_ALGORITHM }];
const jwtExp = () => "1d";

module.exports = {
  JWT_SECRET,
  JWT_LIFETIME,
  JWT_ARGS,

  generateJWT(user) {
    return jwt.sign({ user, expiresIn: jwtExp() }, ...JWT_ARGS);
  },
  verifyJWT(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch(error) {
      throw error
    }
  }
};
