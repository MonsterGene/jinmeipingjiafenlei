var mongoose = require("mongoose")
var translateCounterSchema = require("../schemas/translateCounter")
var translateCounterModel = mongoose.model("translate_counter",translateCounterSchema)

module.exports = translateCounterModel