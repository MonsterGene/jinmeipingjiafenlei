var mongoose = require("mongoose")

var fileSchema = new mongoose.Schema({
    userId:Number,
    originalname:String,
	path:String,
	pending:Number,
    meta:{
        createTime:{
            type:Date,
            default:Date.now()
        }
    }
})

module.exports = fileSchema