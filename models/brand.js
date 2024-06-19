const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let brandSchema = new Schema({
    name: {
        type: String,
        required: [true, "Brand name is required!"]
    },
    description:{
        type:String,
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

module.exports = mongoose.model('Brand', brandSchema)