var mongoose = require("mongoose")
var moment = require("moment")
var iconsole = require("../../functions/logs")

var translateCounterSchema = new mongoose.Schema({
	countDate:{
		type:String,
		required:true,
		minlength:8,
		maxlength:8
	},
	wordCounter:{
		type:Number,
		required:true,
		min:0
	},
	frequencyCounter:{
		type:Number,
		required:true,
		min:0
	},
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

translateCounterSchema.statics.getWordCount = async function(){
	const result = await this.aggregate([
		{$match:{countDate:new RegExp(moment().format("YYYYMM"))}},
		{$group:{
			_id:null,
			wordCount:{$sum:"$wordCounter"}
		}}
	]).exec()

	iconsole.log({title:"async",message:result})
	if(JSON.stringify(result)==="[]") return 0
	return result[0].wordCount || 9999999
}

translateCounterSchema.statics.countWords = function(words,cb){
	return this.updateOne(
		{countDate:moment().format("YYYYMMDD")},
		{
			$inc:{
				wordCounter:words.length,
				frequencyCounter:1
			}
		},
		{upsert:true},
		cb
	)
}

module.exports = translateCounterSchema