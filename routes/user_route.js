const UserController = require("../controllers/user_controller.js");
const {userLoginValidation, userSignupValidation} = require("../middleware/user_validator.js");
const express = require("express");
const routes = express.Router();

routes.get("/all", UserController.getAllUserData); 
routes.get("/all/:userId", UserController.getUserById);

// auth
routes.post('/signup', userSignupValidation, UserController.signup);
routes.post('/login', userLoginValidation, UserController.login);

module.exports = routes;