var mongoose = require("mongoose")

var commentTypeSchema = new mongoose.Schema({
    code:String,
    desc:String,
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

module.exports = commentTypeSchema