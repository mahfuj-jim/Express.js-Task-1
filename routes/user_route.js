const UserController = require("../controllers/user_controller.js");
const {userLoginValidation} = require("../middleware/user_validator.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", UserController.getAllUserData); 
routes.get("/all/:userId", UserController.getUserById);

// auth
routes.post('/signup', UserController.signup);
routes.post('/login', userLoginValidation, UserController.login);

module.exports = routes;