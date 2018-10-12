var mongoose = require("mongoose")
var commentTypeSchema = require("../schemas/commentType")
var commentTypeModel = mongoose.model("comment_type",commentTypeSchema)

module.exports = commentTypeModel