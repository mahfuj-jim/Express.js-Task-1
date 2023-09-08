const AdminController = require("../controllers/admin_controller");
const { validateToken, validateSuperAdminToken } = require("../middleware/token_validation");
const express = require("express");
const router = express.Router();

router.post("/signup", validateToken, validateSuperAdminToken, AdminController.signup);
router.post("/login", AdminController.login);

module.exports = router;