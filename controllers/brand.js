const Brand = require("../models/brand")
const Product = require("../models/product")
// store category in schema

const flash = (req,res, type, message, url) => {
	req.flash(type, message)
	url ? res.redirect(url) : res.status(200).json({})
}
module.exports = {
	createGet : async (req, res) => res.render('pages/brand/create', {mainTitle:'Brand',title : 'Create'}),
  	create : async (req, res) => {
	
		let {name, description} = req.body;

		try {

			if(!name){
				flash(req, res, 'error', 'Brand name is required!', 'back')
			} else {
				const brand = await Brand.findOne({name});
				
				if(brand){
					flash(req, res, 'error', 'Brand already exists!', 'back')
				} else {
					const created = await Brand.create({name, description});
					flash(req, res, 'success', 'Brand created successfully!', 'back')
				}
				
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},
	updateGet : async (req, res) => {
		let {brandId} = req.params;

		try {
			const brand = await Brand.findOne({_id:brandId}).lean();
			res.render('pages/brand/edit', {mainTitle:'Brand',brand, title : 'Update',})
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}	
	},
  	update : async (req, res) => {
	
		let {name, description} = req.body;
		let {brandId} = req.params;
		try {

		   	if(!brandId){
		   		flash(req, res, 'error', 'Brand id is required!', 'back')
		   		
		   	} else if(!name){
		   		flash(req, res, 'error', 'Brand name is required!', 'back')
				
			} else {
				const verifyBrand = await Brand.findOne({_id:brandId});

				if(!verifyBrand) { 
					flash(req, res, 'error', 'Brand not found!', 'back')
					
				}
					
				const brand = await Brand.findOne({name});

				if(!brand){

					var updated = await Brand.updateOne({_id:brandId}, {description, name}, { new: true })
					flash(req, res, 'success', 'Brand updated!', '/brand')
					
				} else {
					if(brand._id == brandId){

						var updated = await Brand.updateOne({_id:brandId}, {description, name}, { new: true })
						flash(req, res, 'success', 'Brand updated!', '/brand')
						
					} else {
						flash(req, res, 'error', 'Brand already exists!', 'back')
					}
				}
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}	
	},
  	destroy : async (req, res) => {
	
		let {brandId} = req.body;

		try {
			const brand = await Brand.findOne({_id:brandId})

			const verifyProduct = await Product.findOne({brandId})
			if(verifyProduct) {
				flash(req, res, 'error', 'Product are there in this brand.', null)
			} else if(!brand) {
				flash(req, res, 'error', 'Brand not found!', null)
			}  else {
				const deleted = await Brand.updateOne({_id:brandId}, {isDeleted:!brand.isDeleted}, { new: true })
			
				flash(req, res, 'success', brand.isDeleted ? 'Brand restored' : 'Brand deleted', null )
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},
  	findAllBrand : async (req, res) => {
	
		try {
			const brand = await Brand.aggregate([
				// { "$match": {isDeleted:false}},
			    { "$sort" : { "createdAt" : -1 } },
	            {
	                "$lookup": {
	                    "from": "products",
	                    "let": { "id": { "$toString": "$_id" }},
	                    "pipeline": [
	                        { "$match": { "$expr": { "$eq": [{ "$toString": "$brandId" }, "$$id"] }}}
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

			return res.render('pages/brand/index', {brand, mainTitle:'Brand', title : 'List'})
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}
	},
	status : async (req, res) => {
		console.log('Hii')
		let {brandId} = req.body;

		try {
			const brand = await Brand.findOne({_id:brandId})
			console.log(brand)
			const verifyProduct = await Product.findOne({brandId:brand._id})
			console.log('verifyProduct',verifyProduct)
			if(verifyProduct) {
				flash(req, res, 'error', 'Product are there in this brand.', null)
			} else if(!brand) {
				flash(req, res, 'error', 'Brand not found!', null)
			}  else {
				const deleted = await Brand.updateOne({_id:brandId}, {status:!brand.status}, { new: true })
				flash(req, res, 'success', brand.status ? 'Brand deactivated' : 'Brand activated', null )
			}
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},

	verifybrand : async (req, res) => {
		let {name, brandId} = req.body;
		
		try {
			const brand = await Brand.findOne({name});

			if(brandId) {

				if(!brand) {
					res.status(200).json({success:true})
				} else {
					if(brand._id != brandId){
						res.status(200).json({success:false})
					} else {
						res.status(200).json({success:true})
					}
				}
				
			} else {
				if(brand) {
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
