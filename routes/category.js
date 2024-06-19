const express = require("express");
const router = express.Router();

const {
    createGet,
    create,
    update,
    destroy,
    findAllCategory,
    status,
    updateGet,
    verifycategory
} = require("../controllers/category.js");

// routes
router.route("/create").get(checkAuth, createGet).post(checkAuth, create);
router.route("/update/:categoryId").get(checkAuth, updateGet).post(checkAuth, update);
router.route("/delete").post(checkAuth, destroy)
router.route("/").get(checkAuth, findAllCategory)
router.route("/status").post(checkAuth, status)
router.route("/verify").post(checkAuth, verifycategory)
module.exports = router;