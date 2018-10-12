var mongoose = require("mongoose")
var commentFileSchema = require("../schemas/commentFile")
var commentFileModel = mongoose.model("comment_file",commentFileSchema)

module.exports = commentFileModel