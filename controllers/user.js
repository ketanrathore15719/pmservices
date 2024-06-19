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

const cartFind = async (userId) => {
	return await Cart.aggregate([
			{
				"$match":{userId}
			},{
                "$lookup": {
                    "from": "products",
                    "let": { "id": "$productId"},
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
                    ],
                    "as": "product_info"
                }
            }, {
	            "$unwind": {
                    "path": "$product_info",
                    "preserveNullAndEmptyArrays": true
	            }
	        }])
}
module.exports = {
	profile : async (req, res) => {
		
		try {
			let address = await Address.find({userId:req?.user?._id})
			res.render('pages/user/profile',{address})
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	updateDefaultAddress: async (req, res) => {

		try {
			let update = await Address.updateMany({userId:req?.user?._id}, {isDefault:false})
			let updated = await Address.updateOne({userId:req?.user?._id, _id:req.body.addressId}, {isDefault:true}, { new: true })

			let address = await Address.find({userId:req?.user?._id})
			res.render('pages/user/profile',{address})
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},

	addressCreate : async (req, res) => {
		try {

			let { mobile, address, address1, city, pincode, defaultaddress } = req.body;
			let isDefault = false;
			if(defaultaddress == 'true') {
				isDefault = true
				let update = await Address.updateMany({userId:req?.user?._id}, {isDefault:false})
			}
			console.log(req.body)
			let created = await Address.create({userId:req?.user?._id, address, address1, city, mobile, pincode, isDefault});

			let addressList = await Address.find({userId:req?.user?._id})
			res.render('pages/user/profile',{address:addressList})
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},


	updateProfile : async (req, res) => {
		try {

			let { name, email, mobile} = req.body;
			
			let addressList = await Address.find({userId:req?.user?._id})
			let user = await User.findOne({email:email})

			if(!user){
				console.log('Hiii')
				var updated = await User.updateOne({_id:req?.user?._id}, {mobile, email, name}, { new: true })
				res.locals.user.name = name;
				res.locals.user.email = email;
				res.locals.user.mobile = mobile;
				res.send({success:true})
			} else {
					if(user._id == req?.user?._id){
					console.log('Hiii1')
					var updated = await User.updateOne({_id:req?.user?._id}, {mobile, email, name}, { new: true })	
					res.locals.user.name = name;
					res.locals.user.email = email;
					res.locals.user.mobile = mobile;
					res.send({success:true})
					} else {
						res.send({success:false, message:"Email already taken!"})
					}
				}
			
			
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	myOrders: async (req, res) => {
		try {

			let invoice = await Invoice.aggregate([
			{
				"$match":{userId:req?.user?._id}
			},{
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
		        $group: {
		            _id: "$invoiceId",
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
		            }
		        }

		    },{
				"$sort":{createdAt:-1},
			},

		    // },{
		    // 	$project: {
		    // 		_id:1,
		    // 		totalPrice:1,
		    //         ordersInfo:1,
		    //         productInfo:1
		    //     }
		    
            ])
            console.log(invoice)
			res.render('pages/user/orders', {invoice})
			
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	}



}