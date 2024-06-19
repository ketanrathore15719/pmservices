const express = require("express");
const router = express.Router();

const {
    orders,
    orderGet,
    deliveryStatusUpdate
} = require("../controllers/admin.js");

// routes
router.route("/orders").get(checkAuth, orders).post(checkAuth, deliveryStatusUpdate)
router.route("/order/view/:invoiceId").get(checkAuth, orderGet)
module.exports = router;