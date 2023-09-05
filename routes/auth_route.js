const AuthController = require("../controllers/auth_controller.js");
const express = require("express");
const routes = express.Router();

routes.post("/signup", AuthController.signup);
routes.post("/login", AuthController.login);

module.exports = routes;