var mongoose = require("mongoose")
var translateCounterSchema = require("../schemas/translateCounter")
var translateCounterModel = mongoose.model("transCounter",translateCounterSchema)

module.exports = translateCounterModel