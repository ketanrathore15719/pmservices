const Category = require("../models/category")
const Product = require("../models/product")
// store category in schema
const create = async (req, res) => {
	
	let {name, description} = req.body;

	try {

		if(!name){
			return res.status(201).json({success:false, message:"Category name is required!"})
		} else {
			const category = await Category.findOne({name});
			
			if(category){
				return res.status(201).json({success:false, message:"Category already exists!"})
			}
			const created = await Category.create({name, description});
			
			return res.status(200).json({success:true, message:"Category created successfully!", data:created})
		}
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}

// update category
const update = async (req, res) => {
	
	let {name, description, categoryId} = req.body;

	try {

	   	if(!categoryId){
	   		return res.status(201).json({success:false, message:"Category id is required!"})
	   	} else if(!name){
			return res.status(201).json({success:false, message:"Category name is required!"})
		} else {
			const verifyCategory = await Category.findOne({_id:categoryId});

			if(!verifyCategory) return res.status(201).json({success:false, message:"Category not found!"})

			const category = await Category.findOne({name});

			if(!category){

				var updated = await Category.updateOne({_id:categoryId}, {description, name}, { new: true })
				
				return res.status(201).json({success:true, message:"Category updated successfully!"})
			} else {
				if(category._id == categoryId){

					var updated = await Category.updateOne({_id:categoryId}, {description, name}, { new: true })
				
					return res.status(201).json({success:true, message:"Category updated successfully!"})
				} else {
					return res.status(201).json({success:false, message:"Category already exists!"})
				}
			}
			const created = await Category.create({name, description});
			
			return res.status(200).json({success:true, message:"Category created successfully!"})
		}
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}

// delete category
const destroy = async (req, res) => {
	
	let {categoryId} = req.body;

	try {
		const category = await Category.findOne({_id:categoryId})

		const verifyProduct = await Product.findOne({categoryId})
		if(verifyProduct) return res.status(201).json({success:false, message:"Product are there in this category."})
		if(!category) return res.status(201).json({success:false, message:"Category not found!"})

		const deleted = await Category.updateOne({_id:categoryId}, {isDeleted:true}, { new: true })
		
		return res.status(200).json({success:true, message:'Category deleted successfully!'})
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}

// find all category
const findAllCategory = async (req, res) => {
	
	try {
	const categoryList = await Category.aggregate([
			{ "$match": {isDeleted:false}},
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

	return res.status(200).json({success:true, message:"Category fetched successfully!", data:categoryList})
	} catch (error) {
		console.log(error)
		return res.status(500).json({success:false, message:error.message})
	}

}

module.exports = {
  create,
  update,
  destroy,
  findAllCategory
}
