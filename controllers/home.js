const Brand = require("../models/brand")
const Product = require("../models/product")
const Category = require("../models/category")
var ObjectId = require('mongodb').ObjectID;

const flash = (req,res, type, message, url) => {
	req.flash(type, message)
	url ? res.redirect(url) : res.status(200).json({})
}

module.exports = {
	home : async (req, res) => res.render('pages/home/index', {title : 'Home'}),
  	categoryBasedProduct : async (req, res) => {
		let {brand_type, search, category_type} = req.query;
		let categoryId = req.params.categoryId;
		let condition = {}
		let categorylist;
		if(brand_type) {
			condition.brandId = brand_type
		}

		if(categoryId){
			condition.categoryId = categoryId;
		} else {
			categorylist = await Category.find({isDeleted:false})
		}

		if(category_type) {
			condition.categoryId = category_type
		} 

		

		if (search) {
            condition['$or'] = [{
                'name': {
                    '$regex': req.query.search,
                    '$options': 'i'
                }
            }, {
                'description': {
                    '$regex': req.query.search,
                    '$options': 'i'
                }
            }]
        }
		try {
			let page = 1;
        	let limit = 20;
        	if (req.query.page) page = req.query.page;
        
        	let skip = limit * (page - 1);


			const product = await Product.aggregate([
	            { "$match": condition},
			    { "$sort" : { "createdAt" : -1 } },
	            { "$skip":skip},
	            { "$limit": limit},
	            {
	                "$lookup": {
	                    "from": "categories",
	                    "let": { "id": "$categoryId"},
	                    "pipeline": [
	                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
	                    ],
	                    "as": "category_info"
	                }
	            },
	            {
	                "$unwind": {
	                    "path": "$category_info",
	                    "preserveNullAndEmptyArrays": true
	                }
	            },
	            {
	                "$lookup": {
	                    "from": "brands",
	                    "let": { "id": "$brandId"},
	                    "pipeline": [
	                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
	                    ],
	                    "as": "brand_info"
	                }
	            },
	            {
	                "$unwind": {
	                    "path": "$brand_info",
	                    "preserveNullAndEmptyArrays": true
	                }
	            },
	        ])
			
			const brand = await Brand.find({isDeleted:false})
			
			res.render('pages/home/product', {product, brand,brand_type,categorylist, category_type})
		} catch (err) {
			console.log(err)
			res.redirect('back')
		}
	},
	findAllProduct : async (req, res) => {
		res.render('pages/home/product-all')
	},
	details : async (req, res) => {
		try {

			const product = await Product.aggregate([
	            { "$match": {_id:ObjectId(req.params.productId)}},
	            {
	                "$lookup": {
	                    "from": "categories",
	                    "let": { "id": "$categoryId"},
	                    "pipeline": [
	                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
	                    ],
	                    "as": "category_info"
	                }
	            },
	            {
	                "$unwind": {
	                    "path": "$category_info",
	                    "preserveNullAndEmptyArrays": true
	                }
	            },
	            {
	                "$lookup": {
	                    "from": "brands",
	                    "let": { "id": "$brandId"},
	                    "pipeline": [
	                        { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
	                    ],
	                    "as": "brand_info"
	                }
	            },
	            {
	                "$unwind": {
	                    "path": "$brand_info",
	                    "preserveNullAndEmptyArrays": true
	                }
	            },
	        ])
			
			res.render('pages/home/productdetails', {product: product.length != 0 ? product[0] : null})
		} catch (err) {
			console.log(err)
			res.redirect('back')
		}
	}
}