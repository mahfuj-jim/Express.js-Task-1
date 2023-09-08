const UserController = require("../controllers/user_controller.js");
const { validateToken, validateAdminToken } = require("../middleware/token_validation");
const express = require("express");
const router = express.Router();

router.get("/all", validateToken, validateAdminToken, UserController.getAllUserData);
router.get("/all/:user_id", validateToken, UserController.getUserById);

module.exports = router;
