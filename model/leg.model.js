const mongoose = require("mongoose")


const legSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    parentId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    business: {
        type: String
    }
})

module.exports = mongoose.model("Leg", legSchema)