var mongoose = require("mongoose")

var commentFileSchema = new mongoose.Schema({
	originalname:String,
	path:String,
	pending:Number,
	total:Number,
	meta:{
		createTime:{
			type:Date,
			default:Date.now()
		},
		updateTime:{
			type:Date,
			default:Date.now()
		}
	}
},{timestamps:{
	createdAt:"meta.createTime",
	updatedAt:"meta.updateTime"
}})

module.exports = commentFileSchema