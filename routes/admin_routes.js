const AdminController = require("../controllers/admin_controller");
const { validateToken, validateUserToken } = require("../middleware/token_validation");
const express = require("express");
const router = express.Router();

router.post("/create", validateUserToken);

module.exports = router;