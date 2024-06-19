const Category = require("../models/category")
const Product = require("../models/product")
// store category in schema

const flash = (req,res, type, message, url) => {
	req.flash(type, message)
	url ? res.redirect(url) : res.status(200).json({})
}
module.exports = {
	createGet : async (req, res) => res.render('pages/category/create', {mainTitle:'Category',title : 'Create'}),
  	create : async (req, res) => {
	
		let {name, description} = req.body;

		try {

			if(!name){
				flash(req, res, 'error', 'Category name is required!', 'back')
			} else {
				const category = await Category.findOne({name});
				
				if(category){
					flash(req, res, 'error', 'Category already exists!', 'back')
				} else {
					const created = await Category.create({name, description});
					flash(req, res, 'success', 'Category created successfully!', 'back')
				}
				
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},
	updateGet : async (req, res) => {
		let {categoryId} = req.params;

		try {
			const category = await Category.findOne({_id:categoryId}).lean();
			res.render('pages/category/edit', {mainTitle:'Category',category, title : 'Update',})
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}	
	},
  	update : async (req, res) => {
	
		let {name, description} = req.body;
		let {categoryId} = req.params;
		try {

		   	if(!categoryId){
		   		flash(req, res, 'error', 'Category id is required!', 'back')
		   		
		   	} else if(!name){
		   		flash(req, res, 'error', 'Category name is required!', 'back')
				
			} else {
				const verifyCategory = await Category.findOne({_id:categoryId});

				if(!verifyCategory) { 
					flash(req, res, 'error', 'Category not found!', 'back')
					
				}
					
				const category = await Category.findOne({name});

				if(!category){

					var updated = await Category.updateOne({_id:categoryId}, {description, name}, { new: true })
					flash(req, res, 'success', 'Category updated!', '/category')
					
				} else {
					if(category._id == categoryId){

						var updated = await Category.updateOne({_id:categoryId}, {description, name}, { new: true })
						flash(req, res, 'success', 'Category updated!', '/category')
						
					} else {
						flash(req, res, 'error', 'Category already exists!', 'back')
					}
				}
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}	
	},
  	destroy : async (req, res) => {
	
		let {categoryId} = req.body;

		try {
			const category = await Category.findOne({_id:categoryId})

			const verifyProduct = await Product.findOne({categoryId})
			if(verifyProduct) {
				flash(req, res, 'error', 'Product are there in this category.', null)
			} else if(!category) {
				flash(req, res, 'error', 'Category not found!', null)
			}  else {
				const deleted = await Category.updateOne({_id:categoryId}, {isDeleted:!category.isDeleted}, { new: true })
			
				flash(req, res, 'success', category.isDeleted ? 'Category restored' : 'Category deleted', null )
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},
  	findAllCategory : async (req, res) => {
	
		try {
			const category = await Category.aggregate([
				// { "$match": {isDeleted:false}},
			    { "$sort" : { "createdAt" : -1 } },
	            {
	                "$lookup": {
	                    "from": "products",
	                    "let": { "id": { "$toString": "$_id" }},
	                    "pipeline": [
	                        { "$match": { "$expr": { "$eq": [{ "$toString": "$categoryId" }, "$$id"] }}}
	                    ],
	                    "as": "project_info"
	                }
	            },
	            {
	            	"$project":{
	            		"_id":1,
	            		"name":1,
	            		"isDeleted":1,
	            		"status":1,
	            		"productCount":{"$size":"$project_info"}
	            	}
	            }
			])
			
			return res.render('pages/category/index', {category, mainTitle:'Category', title : 'List'})
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},
	status : async (req, res) => {
	
		let {categoryId} = req.body;

		try {
			const category = await Category.findOne({_id:categoryId})

			const verifyProduct = await Product.findOne({categoryId})

			if(verifyProduct) {
				flash(req, res, 'error', 'Product are there in this category.', null)
			} else if(!category) {
				flash(req, res, 'error', 'Category not found!', null)
			}  else {
				const deleted = await Category.updateOne({_id:categoryId}, {status:!category.status}, { new: true })
				flash(req, res, 'success', category.status ? 'Category deactivated' : 'Category activated', null )
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},

	verifycategory : async (req, res) => {
		let {name, categoryId} = req.body;
		
		try {
			const category = await Category.findOne({name});

			if(categoryId) {

				if(!category) {
					res.status(200).json({success:true})
				} else {
					if(category._id != categoryId){
						res.status(200).json({success:false})
					} else {
						res.status(200).json({success:true})
					}
				}
				
			} else {
				if(category) {
					res.status(200).json({success:false})
				} else {
					res.status(200).json({success:true})
				}
			}
			
		
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	}

}
