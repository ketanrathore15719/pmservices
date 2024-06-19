const express = require("express");
const router = express.Router();

const {
    home,
    categoryBasedProduct,
    details,
    findAllProduct
} = require("../controllers/home.js");

// routes
router.route("/").get(home)
router.route("/product/:category/:categoryId").get(categoryBasedProduct)
router.route("/product/details/:name/:productId").get(details)
router.route("/all/product").get(categoryBasedProduct)
module.exports = router;