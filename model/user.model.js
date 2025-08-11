const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username : {
        type : String
    },
    partners :[ {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    sponsorId : {
        type : String
    },
    level:[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    parentId : {
       type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    upperline : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    sponsorName : {
        type : String
    },
    firstName : {
        type : String
    },
    lastName : {
        type : String
    },
    dob:{
        type : Date
    },
    email : {
        type : String
    },
    mobile:{
        type : String
    },
    gender : {
        type : String
    },
    state:{
        type : String
    },
    pincode:{
        type : String
    },
    address:{
        type : String
    },
    password : {
        type : String
    }
})



module.exports = mongoose.model("User", userSchema)