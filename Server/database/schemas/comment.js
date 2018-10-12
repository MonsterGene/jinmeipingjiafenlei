var mongoose = require("mongoose")

var commentSchema = new mongoose.Schema({
	sellerAccount:String,
	buyerAccount:String,
	originComment:String,
	translatedComment:String,
	commentTime:String,
	produce:String,
	price:String,
	firstType:String,
	secondType:String,
	remark:String,
	fromFileId:{type:String,default:""},
	fromFileName:{type:String,default:""},
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
},{
	timestamps:{
		createdAt:"meta.createTime",
		updatedAt:"meta.updateTime"
	}
})

module.exports = commentSchema