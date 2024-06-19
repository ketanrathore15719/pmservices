const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let productSchema = new Schema({
    categoryId:{
        type:String,
        required:true
    },
    brandId:{
        type:String,
        required:true
    },
    name: {
        type: String,
        required: [true, "Product name is required!"]
    },
    price: {
        type:Number,
        required:[true, "Price field is required!"]
    },
    description:{
        type:String,
    },
    thumbnail:{
        public_id:String,
        url:String
    },
    status:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},
{
    timestamps: true,
})

module.exports = mongoose.model('Product', productSchema)