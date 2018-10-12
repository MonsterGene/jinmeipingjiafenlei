var mongoose = require("mongoose")
var typeListSchema = require("../schemas/pinjiafenlei")
var typeListModel = mongoose.model("typeList",typeListSchema)

module.exports = typeListModel