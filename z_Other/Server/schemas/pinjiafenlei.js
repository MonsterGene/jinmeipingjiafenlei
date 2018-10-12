var mongoose = require("mongoose")

var typeListSchema = new mongoose.Schema({
    code:String,
    desc:String,
    meta:{
        createTime:{
            type:Date,
            default:Date.now()
        }
    }
})


module.exports = typeListSchema