const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let orderSchema = new Schema({
    productId: {
        type: String,
    },
    userId:{
        type:String,
    },
    addressId:{
        type:String
    },
    invoiceId:{
        type:String,
    },
    price:{
        type:Number,
    },
    qty:{
        type:Number,
    },
    paymentMode:{
        type:String,
    },
    paymentStatus:{
        type:Boolean,
        default:false
    },
},
{
    timestamps: true,
})

module.exports = mongoose.model('Order', orderSchema)