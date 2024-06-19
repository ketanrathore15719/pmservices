const express = require("express");
const router = express.Router();

const {
    createGet,
    create,
    update,
    destroy,
    findAllBrand,
    status,
    updateGet,
    verifybrand
} = require("../controllers/brand.js");

// routes
router.route("/create").get(checkAuth, createGet).post(checkAuth, create);
router.route("/update/:brandId").get(checkAuth, updateGet).post(checkAuth, update);
router.route("/delete").post(checkAuth, destroy)
router.route("/").get(checkAuth, findAllBrand)
router.route("/status").post(checkAuth, status)
router.route("/verify").post(checkAuth, verifybrand)
module.exports = router;