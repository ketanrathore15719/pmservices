const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let brandSchema = new Schema({
    name: {
        type: String,
        required: [true, "User name is required!"]
    },
    email:{
        type:String,
    },
    mobile:{
        type:Number,
    },
    password:{
        type:String,
    },
    role:{
        type:Number,
        default:2,
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

module.exports = mongoose.model('User', brandSchema)