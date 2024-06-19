const express = require("express");
const router = express.Router();

const {
    create,
    cartGet,
    cartPost,
    orderSummary,
    orderConfirm,
    orderSuccess,
    remove,
    updateCart
} = require("../controllers/cart.js");

// routes
router.route("/create").post(checkCustomerAuth, create)
router.route('/').post(cartPost).get(checkCustomerAuth, cartGet)
router.route('/order/summary').post(checkCustomerAuth, orderSummary).get(checkCustomerAuth, orderSummary)
router.route('/order/confirm').post(checkCustomerAuth, orderConfirm)
router.route('/order/payment/status/:status').get(checkCustomerAuth, orderSuccess)
router.route('/remove/:cartId/:userId').get(checkCustomerAuth, remove)
router.route('/update').post(checkCustomerAuth, updateCart)
module.exports = router;