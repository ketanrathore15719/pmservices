const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let cartSchema = new Schema({
    productId: {
        type: String,
    },
    userId:{
        type:String,
    },
    price:{
        type:Number,
    },
    qty:{
        type:Number,
    }
},
{
    timestamps: true,
})

module.exports = mongoose.model('Cart', cartSchema)