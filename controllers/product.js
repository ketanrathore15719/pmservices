const Product = require("../models/product")
const Category = require("../models/category")
const Brand = require("../models/brand")
const fs = require("fs");
const {fileUpload, fileRemove} = require("../helpers/fileUpload")
var ObjectId = require('mongodb').ObjectID;
const flash = (req,res, type, message, url) => {
	req.flash(type, message)
	url ? res.redirect(url) : res.status(200).json({})
}
module.exports = {
	createGet : async (req, res) => {
		let category = await Category.find({isDeleted:false});
		let brand = await Brand.find({isDeleted:false})
		res.render('pages/product/create', {category, brand, mainTitle:'Product', title : 'Create'})
	},
	create : async (req, res) => {
	
		let {name, description, categoryId, price, brandId} = req.body;
		const thumbnail = req.files.thumbnail.tempFilePath;

		try {

			const mycloud = await fileUpload(thumbnail)
			
			if(!name){
				flash(req, res, 'error', 'Product name is required!', 'back')
			} else {

				const category = await Category.findOne({_id:categoryId})
				if(!category) flash(req, res, 'error', 'Category not found!', 'back')

				const product = await Product.findOne({name});
				
				if(product){
					flash(req, res, 'error', 'Product already exists!', 'back')
				} else { 
					const created = await Product.create({name,
													price,
													brandId,
													categoryId,
													thumbnail:{ 
														public_id: mycloud.public_id,
														url: mycloud.secure_url,
													}, 
													description
												});
					flash(req, res, 'success', 'Product created successfully!', 'back')
				}
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},
	updateGet : async (req, res) => {
		let {productId} = req.params;

		try {
			const product = await Product.findOne({_id:productId}).lean();
			const category = await Category.find({isDeleted:false})
			const brand = await Brand.find({isDeleted:false})
			res.render('pages/product/edit', {product, category, brand,  mainTitle:'Product', title : 'Update',})
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}	
	},
	update: async (req, res) => {
	
		let { name, description, categoryId, price, brandId} = req.body;

		let { productId } = req.params;

		const thumbnail = req.files?.thumbnail?.tempFilePath;
		
		try {

		   	if(!productId){
		   		flash(req, res, 'error', 'Product id is required!', 'back')
		   	} else if(!name){
		   		flash(req, res, 'error', 'Product name is required!', 'back')
			} else {
					

				const verifyproduct = await Product.findOne({_id:productId});

				if(!verifyproduct) {
					flash(req, res, 'error', 'Product not found!', 'back')
				} else {
					let mycloud
					if(thumbnail){
						
						if(verifyproduct._id == productId){
							await fileRemove(verifyproduct.thumbnail.public_id)
							mycloud = await fileUpload(thumbnail)
							var updated = await Product.updateOne({_id:productId}, {
																	thumbnail:{ 
																		public_id: mycloud.public_id,
																		url: mycloud.secure_url,
																	}, 
																	}, { new: true })
						}
						
					}

					const product = await Product.findOne({name});

					if(!product){
						var updated = await Product.updateOne({_id:productId}, {description, price, name, categoryId, brandId }, { new: true })
						flash(req, res, 'success', 'Product updated successfully!', '/product')						
					} else {
						if(product._id == productId){
							var updated = await Product.updateOne({_id:productId}, {description, price, name, categoryId,brandId }, { new: true })					
							flash(req, res, 'success', 'Product updated successfully!', '/product')
						} else {
							flash(req, res, 'error', 'Product already exists!', 'back')
						}
					}
				}
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	destroy: async (req, res) => {
	
		let {productId} = req.body;

		try {
			if(!productId) {
				flash(req, res, 'error', 'Product id is required!', 'back')
			} else {
				const product = await Product.findOne({_id:productId})

				if(!product) {
					flash(req, res, 'error', 'Product not found!', 'back')
				} else {
					const updated = await Product.updateOne({_id:productId}, {isDeleted:!product.isDeleted}, { new: true })
					flash(req, res, 'success', product.isDeleted ? 'Product restored' : 'Product deleted', null )
				}
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},

	findAllProduct: async (req, res) => {
		let {category_type, brand_type, search} = req.query;

		let condition = {}

		if(category_type) {
			condition.categoryId = category_type
		}

		if(brand_type) {
			condition.brandId = brand_type
		}
		if (req.query.search) {
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

        let page = 1;
        let limit = 4;
        if (req.query.page) page = req.query.page;
        
        let skip = limit * (page - 1);

		try {
			let total_leads = await Product.countDocuments(condition);
			const category = await Category.find({isDeleted:false})
			const brand = await Brand.find({isDeleted:false})
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
	        ])

		res.render('pages/product/index', { mainTitle:'Product',
											title : 'List',
											product,
											search, 
											category, 
											category_type,
											brand,
											brand_type,
											start_record: skip + 1, //First record count
							                end_record: skip + product.length, //last record of page count
							                total_records: total_leads, //Total record of page count
											pagination: { page: page, totalPage: Math.ceil(total_leads / limit), url: req.originalUrl, },
											totalProduct: total_leads === 0 ? true : false
										})
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},

	status: async (req, res) => {
	
		let {productId} = req.body;

		try {
			if(!productId) {
				flash(req, res, 'error', 'Product id is required!', null)
			} else {
				const product = await Product.findOne({_id:productId})

				if(!product) {
					flash(req, res, 'error', 'Product not found!', 'back')
				} else {
					const updated = await Product.updateOne({_id:productId}, {status:!product.status}, { new: true })
					flash(req, res, 'success', product.status ? 'Product deactivated' : 'Product activated', null )
				}
			}
			
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},

	verifyproduct : async (req, res) => {
		let {name, productId} = req.body;

		try {
			const product = await Product.findOne({name});

			if(productId) {
				if(!product){ 
					res.status(200).json({success:true})
				} else {
					if(product._id != productId){
					res.status(200).json({success:false})
					
					} else {
						res.status(200).json({success:true})
					}
				}
				
			} else {
				if(product) {
					res.status(200).json({success:false})
				} else {
					res.status(200).json({success:true})
				}
			}
			
		
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},

	productDetails : async (req, res) => {
		try {
	        const product = await Product.aggregate([
	            { "$match": {_id:ObjectId(req.params.productId)}},
			    { "$sort" : { "createdAt" : -1 } },
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

	     	res.send({success:true, product : product.length != 0 ? product[0] : []})
	    } catch (error) {
	    	console.log(error)
	        res.send({ type: 'error', lead: null });
	    }
	}
}