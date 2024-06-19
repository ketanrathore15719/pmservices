const express = require("express");
const router = express.Router();

const {
    loginGet,
    login,
    registerGet,
    register,
    logout
} = require("../controllers/auth.js");

// routes
router.route("/login").get(loginGet).post(login);
router.route("/register").get(registerGet).post(register);
router.route("/logout").get(logout)
module.exports = router;