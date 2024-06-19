const Brand = require("../models/brand")
const Product = require("../models/product")
const Category = require("../models/category")
const Cart = require("../models/cart")
const Address = require("../models/address")
const Order = require("../models/order")
const Invoice = require("../models/invoice")
var ObjectId = require('mongodb').ObjectID;
const Stripe = require('stripe');
const moment = require("moment")
// const stripe = Stripe('sk_test_51LIQgOEeinfhBvKfzcIx6uFVpqep1RoocgLQIYxAtjwMwKoi9MLu005oKzwcXxytOCgrqZKpzY8I2nTGD81VxVU700N5iJYK6G')

// let stripePublishableKey = 'pk_test_51LIQgOEeinfhBvKfclnWJdPyjDJONjOSew2JX7dtFhlvT0TEQbabsKhhKnZvbXcib0YGldt1HlkQzfrQ7rPtR70S00IJcDzfKT'

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
	create : async (req, res) => {
		let {productId, price, qty} = req.body;
		try {

			let cart = await Cart.find({userId:req?.user?._id, productId})
	
			if(cart.length != 0) {

				res.send({success:false})
			} else {
				
				let created = await Cart.create({productId, userId:req?.user?._id, price, qty})
				res.send({success:true})
			}
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},
	cartGet : async (req, res) => {
		try {
			let cart = await cartFind(req?.user?._id)

			if(req.body.type == 'api') {
				res.send({success:true, cart, cartnumber:cart.length})
			} else {
				res.render('pages/cart/index', {cart, cartnumber:cart.length})
			}
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	cartPost : async (req, res) => {
		try {
			let cart = await Cart.find({userId:req?.user?._id})

			if(req.body.type == 'api') {
				res.send({success:true, cart, cartnumber:cart.length})
			} else {
				res.render('pages/cart/index', {cart, cartnumber:cart.length})
			}
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},
	orderSummary : async (req, res) => {
		try {
			let {payment} = req.body
			let cart = await cartFind(req?.user?._id)

			let address = await Address.find({userId:req.user._id})
			let mode = payment == 'cod' ? 'Cash On Delivery' : 'Pay With Online'

			if(cart.length == 0){
				req.flash('error', 'Cart is empty')
				res.redirect('/')
			} else {
				res.render('pages/cart/order', {cart, cartnumber:cart.length, payment,mode, address})
			}
			
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},
	orderConfirm : async (req, res) => {
		try {
			let userId = req.user._id;
			let addressCreate;
			let addressId;
			let {payment, totalPrice} = req.body;
			let paymentStatus = false;

			if(req.body.addressType != 'new') {
				console.log('Hii', req.body)
				addressId = req.body.addressType;
			} else {
				console.log('Hellow', req.body)
				req.body.userId = req.user._id;
				req.body.isDefault = false;
				addressCreate = await Address.create(req.body)
				addressId = addressCreate._id
			}			
			
			let cart = await Cart.find({userId})

			// for(data in cart) {
			// 	let orderCreate = await Order.create({ productId:cart[data].productId,
			// 										   userId,
			// 										   addressId,
			// 										   price:cart[data].price,
			// 										   qty:cart[data].qty,
			// 										   paymentMode:payment,
			// 										   paymentStatus,
			// 										   invoice:'123123'

			// 										})
			// }

			if (payment == 'cod') {
				res.locals.user.payment = {type:'cod', totalPrice:totalPrice, addressId}
				//await Cart.deleteMany({userId:req.user._id})
				res.redirect('/cart/order/payment/status/cod')
			} else {
				const stripe = Stripe('sk_test_51LHjWaSEcTV16hI92mOkLrB9xpJ8NU1NplEva3Yqd5DRuYVXBjuMTziN8TWJpRXZft3nEUH75xV2CGbhFYYSvM9t00u38E9JqI')

				const {id:prodId} = await stripe.products.create({ name:req.user.name });

		
				const {id:priceId} = await stripe.prices.create({
				  	unit_amount: Number(totalPrice) * 100,
				  	currency: 'inr',
				  	product: prodId,
				});

				const session = await stripe.checkout.sessions.create({
					success_url: config.url+'/cart/order/payment/status/online',
					cancel_url: config.url+'/cart',
					line_items: [{ price: priceId ||'price_1LHldgSEcTV16hI9iKJ2LeDd', quantity: 1 }],
					mode: 'payment',
				});
				
				res.locals.user.payment = {type:'online', stripeId:session.id,  totalPrice:totalPrice, addressId}
				//await Payment.create({userId:req?.user?._id, token:session.id, type:'online'})
				
				if (session?.url) {
					res.redirect(session?.url)
				} else {
					return res.json({url:'http://localhost:3300'})
				}
			}
			
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	orderSuccess: async (req, res) => {
		try {

			let cart = await Cart.find({userId:req?.user?._id})
			let invoiceId = `INVID-${moment().format('DDMMYYYYhhmmss')}`
			let  {addressId, type, stripeId, totalPrice} = res.locals.user.payment
			if(req.params.status == 'cod') {

				if(res.locals.user.payment.type == 'cod') {
					let invoiceCreate = await Invoice.create({addressId, userId:req?.user?._id, invoiceId, totalPrice, paymentMode:type, isStatus:true})
					for(data in cart) {
						let orderCreate = await Order.create({ productId:cart[data].productId,
															   userId:req?.user?._id,
															   addressId,
															   invoiceId:invoiceCreate._id,
															   price:cart[data].price,
															   qty:cart[data].qty,
															})
					}

					await Cart.deleteMany({userId:req.user._id})
					res.locals.user.payment = {}
					res.render('pages/cart/success')
				} else {
					res.redirect('/')
				}
				
			} else {

				let stripeId = res.locals.user.payment.stripeId

				if(res.locals.user.payment.status == 'failed') {
					res.locals.user.payment = {}
					res.redirect('/')
				} else {
					if(stripeId) {
						const stripe = require('stripe')('sk_test_51LHjWaSEcTV16hI92mOkLrB9xpJ8NU1NplEva3Yqd5DRuYVXBjuMTziN8TWJpRXZft3nEUH75xV2CGbhFYYSvM9t00u38E9JqI');

						const session = await stripe.checkout.sessions.retrieve(stripeId);

						if(session.status == 'complete') {

							let invoiceCreate = await Invoice.create({addressId, userId:req?.user?._id, invoiceId, totalPrice, paymentMode:type, isStatus:true})
							for(data in cart) {
								let orderCreate = await Order.create({ productId:cart[data].productId,
																	   userId:req?.user?._id,
																	   addressId,
																	   invoiceId:invoiceCreate._id,
																	   price:cart[data].price,
																	   qty:cart[data].qty,
																	})
							}

							res.locals.user.payment = {}
							await Cart.deleteMany({userId:req.user._id})
							res.render('pages/cart/success')
						} else {
							res.locals.user.payment = {status:'failed'}
							res.render('pages/cart/failed')
						}
					} else {
						res.redirect('/')
					}	
				}
			}
			
		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	remove: async (req, res) => {
		try {
			
			let {cartId, userId} = req.params;

			await Cart.deleteOne({_id:cartId, userId})

			let cart = await cartFind(req?.user?._id)
			
			res.render('pages/cart/index', {cart, cartnumber:cart.length})

		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	updateCart: async (req, res) => {
		try {
			
			let {cartId, qty, price} = req.body;

			let cartdata = await Cart.findOne({_id:cartId})

			if(cartdata) {
				cartdata.price = price * qty;
				cartdata.qty =  qty
				const updated = await cartdata.save();
			}
			let cart = await cartFind(req?.user?._id)
			
			res.render('pages/cart/index', {cart, cartnumber:cart.length})

		} catch(error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	}
}