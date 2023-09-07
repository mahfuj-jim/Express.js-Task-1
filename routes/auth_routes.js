const AuthController = require("../controllers/auth_controller.js");
const { validateSignup, validateLogin } = require("../middleware/auth_validator.js");
const { validateAdminToken } = require("../middleware/token_validation.js");
const express = require("express");
const router = express.Router();

router.post("/signup", validateSignup, (req, res, next) => {
    const { role } = JSON.parse(req.body);
    if (role === 2 || role === 3) {
        validateAdminToken(req, res, next);
    } else {
        next();
    }
}, AuthController.signup);
router.post("/login", validateLogin, AuthController.login);

module.exports = router;