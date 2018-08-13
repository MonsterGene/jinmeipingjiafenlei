var express = require('express');
var multer = require("multer")

var app = express();
var upload = multer({dest:"Server/uploads"})

app.use(express.static("dist"))

app.post('/fileUpload',upload.any(),function (req, res) {
    var jm = require("./jmfile.js")
    jm(req,res)
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});