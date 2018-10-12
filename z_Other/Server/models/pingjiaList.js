var mongoose = require("mongoose")
var pinjiaListSchema = require("../schemas/pinjiaList")
var pinjiaListModel = mongoose.model("pinjiaList",pinjiaListSchema)

module.exports = pinjiaListModel