const express = require("express");
const router = express.Router();

const {
    createGet,
    create,
    update,
    destroy,
    findAllProduct,
    status,
    updateGet,
    verifyproduct,
    productDetails
} = require("../controllers/product.js");
console.log(checkAuth)
// routes
router.route("/create").get(checkAuth, createGet).post(checkAuth, create);
router.route("/update/:productId").get(checkAuth, updateGet).post(checkAuth, update);
router.route("/delete").post(checkAuth, destroy)
router.route("/").get(checkAuth, findAllProduct)
router.route("/status").post(checkAuth, status)
router.route("/verify").post(checkAuth, verifyproduct)
router.route("/view/:productId").get(checkAuth, productDetails)
module.exports = router;