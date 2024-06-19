const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let invoiceSchema = new Schema({
    userId:{
        type:String,
    },
    addressId:{
        type:String,
    },
    invoiceId:{
        type:String,
    },
    totalPrice:{
        type:String,
    },
    paymentMode:{
        type:String,
    },
    isStatus:{
        type:Boolean,
        default:false,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    isDelivered:{
        type:Boolean,
        default:false
    },
    deliveryStatus:{
        type:String,
        default:'Order Placed'
    }
},
{
    timestamps: true,
})

module.exports = mongoose.model('invoice', invoiceSchema)