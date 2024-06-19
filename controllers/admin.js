const Brand = require("../models/brand")
const Product = require("../models/product")
const Category = require("../models/category")
const Cart = require("../models/cart")
const Address = require("../models/address")
const Order = require("../models/order")
const Invoice = require("../models/invoice")
var ObjectId = require('mongodb').ObjectID;
const Stripe = require('stripe');
const User = require("../models/user")

const flash = (req,res, type, message, url) => {
	req.flash(type, message)
	url ? res.redirect(url) : res.status(200).json({})
}


module.exports = {

	orders: async (req, res) => {
		try {

			let invoice = await Invoice.aggregate([
			{
                "$lookup": {
                    "from": "orders",
                    "let": { "id": "$_id"},
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": [{ "$toString": "$invoiceId" }, { "$toString": "$$id" }] }}}
                    ],
                    "as": "order_info"
                }
            },{
            	"$unwind": {
                    "path": "$order_info",
                    "preserveNullAndEmptyArrays": true
	            }
            },{
            	"$lookup": {
                    "from": "products",
                    "let": { "id": "$order_info.productId"},
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id" ] }}}
                    ],
                    "as": "product_info"
                }
             },{
            	"$unwind": {
                    "path": "$product_info",
                    "preserveNullAndEmptyArrays": true
	            }
	        },{
            	"$lookup": {
                    "from": "users",
                    "let": { "id": "$userId"},
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id" ] }}}
                    ],
                    "as": "user_info"
                }
             },{
            	"$unwind": {
                    "path": "$user_info",
                    "preserveNullAndEmptyArrays": true
	            }
	        },{
            	"$lookup": {
                    "from": "addresses",
                    "let": { "id": "$addressId"},
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id" ] }}}
                    ],
                    "as": "address_info"
                }
             },{
            	"$unwind": {
                    "path": "$address_info",
                    "preserveNullAndEmptyArrays": true
	            }
            },{
		        $group: {
		            _id: "$invoiceId",
		            name: { $first: "$user_info.name"},
		            email: { $first: "$user_info.email"},
		            mobile: { $first: "$user_info.mobile"},
		            address: { $first: "$address_info.address"},
		            address1: { $first: "$address_info.address1"},
		            city: { $first: "$address_info.city"},
		            pincode: { $first: "$address_info.pincode"},
		            updatedAt: { $first : "$updatedAt"},
		            isDelivered: { $first : "$isDelivered"},
		            deliveryStatus: { $first : "$deliveryStatus"},
		            createdAt: { $first : "$createdAt"},
		            invoiceId: { $first: "$invoiceId" },
		            paymentMode: { $first: "$paymentMode" },
		            totalPrice: { $first: "$totalPrice" },
		            isStatus: { $first: "$isStatus"},
		            orderInfo:{
		            	$push:"$order_info"
		            },
		            productInfo:{
		            	$push:"$product_info"
		            }, 
		        }
		    },{
				"$sort":{createdAt:-1},
			},
            ])
           
           
			res.render('pages/admin/orders', {invoice})
			
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	orderGet : async (req, res) => {
		
	},

	deliveryStatusUpdate : async (req, res) => {
		try {
			let {invoiceId, deliveryStatus} = req.body;

			let isDelivered = false

			if(deliveryStatus == 'Order Delivered') {
				isDelivered = true
			}

			let updated = await Invoice.updateOne({invoiceId}, {deliveryStatus, isDelivered})
			return res.send({success:true})

		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	}
}