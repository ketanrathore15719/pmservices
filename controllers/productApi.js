const Product = require("../models/product")
const Category = require("../models/category")
const fs = require("fs");
const {fileUpload, fileRemove} = require("../helpers/fileUpload")

// store product in schema
const create = async (req, res) => {
	
	let {name, description, categoryId} = req.body;
	const thumbnail = req.files.thumbnail.tempFilePath;

	try {

		const mycloud = await fileUpload(thumbnail)
		
		if(!name){
			return res.status(201).json({success:false, message:"Product name is required!"})
		} else {

			const category = await Category.findOne({_id:categoryId})
			if(!category) return res.status(201).json({success:false, message:"Category not found!"})

			const product = await Product.findOne({name});
			
			if(product){
				return res.status(201).json({success:false, message:"Product already exists!"})
			}
			const created = await Product.create({name,
												categoryId,
												thumbnail:{ 
													public_id: mycloud.public_id,
													url: mycloud.secure_url,
												}, 
												description
												});
			
			return res.status(200).json({success:true, message:"Product created successfully!", data:created})
		}
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}

const update = async (req, res) => {
	
	let {name, description, productId} = req.body;
	const thumbnail = req.files?.thumbnail?.tempFilePath;
	try {

	   	if(!productId){
	   		return res.status(201).json({success:false, message:"Product id is required!"})
	   	} else if(!name){
			return res.status(201).json({success:false, message:"Product name is required!"})
		} else {
				

			const verifyproduct = await Product.findOne({_id:productId});

			if(!verifyproduct) return res.status(201).json({success:false, message:"Product not found!"})

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
				var updated = await Product.updateOne({_id:productId}, {description, name}, { new: true })
				
				return res.status(201).json({success:true, message:"Product updated successfully!"})
			} else {
				if(product._id == productId){
					var updated = await Product.updateOne({_id:productId}, {description, name}, { new: true })
			
					return res.status(201).json({success:true, message:"Product updated successfully!"})
				} else {
					return res.status(201).json({success:false, message:"Product already exists!"})
				}
			}
			const created = await Product.create({name, description});
		
			return res.status(200).json({success:true, message:"Product created successfully!"})
		}
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}


const destroy = async (req, res) => {
	
	let {productId} = req.body;

	try {
		if(!productId) return res.status(201).json({success:false, message:"Product id is required!"})

		const product = await Product.findOne({_id:productId})
		if(!product) return res.status(201).json({success:false, message:"Product not found!"})

		const deleted = await Product.updateOne({_id:productId}, {isDeleted:true}, { new: true })
		
		return res.status(200).json({success:true, message:'Product deleted successfully!'})
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}


const findAllProduct = async (req, res) => {
	
	try {
		const productList = await Product.aggregate([
            { "$match": {"isDeleted":false}},
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
        ])

	return res.status(200).json({success:true, message:"Product fetched successfully", data:productList})
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}

module.exports = {
  create,
  update,
  destroy,
  findAllProduct
}
