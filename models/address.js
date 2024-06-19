const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let addressSchema = new Schema({
    userId:{
        type:String,
    },
    address:{
        type:String,
    },
    address1:{
        type:String,
    },
    city:{
        type:String,
    },
    pincode:{
        type:String
    },
    mobile:{
        type:Number,
    },
    isDefault:{
        type:Boolean,
        default:false
    }
},
{
    timestamps: true,
})

module.exports = mongoose.model('Address', addressSchema)