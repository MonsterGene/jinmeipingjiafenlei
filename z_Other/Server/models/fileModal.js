var mongoose = require("mongoose")
var fileSchema = require("../schemas/fileSchemas")
var file = mongoose.model("file",fileSchema)

module.exports = file