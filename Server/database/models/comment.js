var mongoose = require("mongoose")
var commentSchema = require("../schemas/comment")
var commentModel = mongoose.model("comments",commentSchema)

module.exports = commentModel