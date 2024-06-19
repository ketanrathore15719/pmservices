const express = require("express");
const router = express.Router();

const {
    profile,
    updateDefaultAddress,
    addressCreate,
    updateProfile,
    myOrders
} = require("../controllers/user.js");

// routes
router.route("/profile").get(checkCustomerAuth, profile)
router.route("/profile/address/default").post(checkCustomerAuth, updateDefaultAddress)
router.route("/profile").post(checkCustomerAuth, addressCreate)
router.route("/profile/update").post(checkCustomerAuth, updateProfile)
router.route("/profile/orders").get(checkCustomerAuth, myOrders)
module.exports = router;