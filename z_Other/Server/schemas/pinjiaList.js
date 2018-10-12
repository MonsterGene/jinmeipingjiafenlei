var mongoose = require("mongoose")

var pinjiaListSchema = new mongoose.Schema({
    sUName:String,
    bUName:String,
    originContent:String,
    translatedText:String,
    pjTime:String,
    produce:String,
    price:String,
    mark:String,
    firstType:String,
    secondType:String,
    desc:String,
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
},{timestamps:{
	createdAt:"meta.createTime",
	updatedAt:"meta.updateTime"
}})


module.exports = pinjiaListSchema