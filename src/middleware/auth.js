const JWT = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;

///////////////////////// Authentication ////////////////////////////////////////

const authentication = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "token must be present" });

    token = token.replace(/^Bearer\s+/, "");

    JWT.verify(token, "shoppingCartSecreteKey", function (error, validToken) {
      if (error) {
        return res.status(401).send({ status: false, msg: error.message });
      } else {
        req.token = validToken;
        next();
      }
    });

  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
};

/////////////////////////// Authorisation //////////////////////////////

// const authorisation = async (req, res, next) => {

//     try {
//         let loggedInUser = req.validateToken.userId

//         let userId = req.params.userId
//         if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, msg: "Invalid bookId" })

//         let user = await UserModel.findById(userId)
//         if (!user) return res.status(404).send({ status: false, msg: "user does not exist" })

//         let requestingUser = user.userId
//         if (loggedInUser != requestingUser) return res.status(403).send({ status: false, msg: "User is not authorised" })

//         next()
//     } catch (err) {
//         res.status(500).send({ status: "error", error: err.message });
//     }
// }

module.exports = { authentication };
