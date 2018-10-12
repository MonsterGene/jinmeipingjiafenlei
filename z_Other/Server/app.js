var express = require('express');
var multer = require("multer") //主要于上传文件
var bodyParser = require("body-parser")
var historyApiFallback = require("connect-history-api-fallback")

processArg = process.argv.slice(2)
processArg = processArg.reduce((acc, cur) => {
    [key, val] = cur.split("=")
    acc[key] = val
    return acc
}, {})

var app = express();
console.log(processArg)
if (processArg.node_env === "dev"){
    global.global.uploadPath = "Server/uploads"
} else {
    global.global.uploadPath = "uploads"
}

// var upload = multer({ dest: global.global.uploadPath })

// app.use(historyApiFallback())
// app.use(express.static("dist"))
// app.use("*", function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By", ' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// })
// app.use(bodyParser.urlencoded())

// app.post('/fileUpload', upload.any(), function(req, res) {
//     var jm = require("./jmfile.js")
//     jm(req, res)
// });
// app.post("/getFileList", function(req, res) {
// 	var fileList = require("./modules/pingjiaDataList")
// 	fileList.getFileList(req, res)
// })
// app.post("/uploadPingjiaData", upload.single("pjFile"), function(req, res) {
//     var fileList = require("./modules/pingjiaDataList")
//     fileList.dataUpload(req, res)
// })
// app.post("/delFile", function(req, res) {
//     var fileList = require("./modules/pingjiaDataList")
//     fileList.delFile(req, res)
// })

// app.post("/getTypeList", function(req, res) {
//     let typeList = require("./modules/typeList.js")
//     typeList.getTypeList(req, res)
// })
// app.post("/setType", function(req, res) {
//     let typeList = require("./modules/typeList")
//     typeList.setType(req, res)
// })
// app.post("/addType", function(req, res) {
//     let typeList = require("./modules/typeList")
//     typeList.addType(req, res)
// })
// app.post("/delType", function(req, res) {
//     let typeList = require("./modules/typeList")
//     typeList.delType(req, res)
// })

// app.post("/getEvalList", function(req, res) {
//     let fileList = require("./modules/pingjiaDataList")
//     fileList.getEvalList(req, res)
// })
// app.post("/updateEvalType", function(req, res) {
//     let fileList = require("./modules/pingjiaDataList")
//     fileList.updateEvalType(req, res)
// })
// app.post("/updateEval", function(req, res) {
//     let fileList = require("./modules/pingjiaDataList")
//     fileList.updateEval(req, res)
// })

// app.get("/baiduFanyi/common", function(req, res) {
//     const doTrans = require("./modules/baiduFanyi/common")
//     doTrans(req, res, "get")
// })
// app.post("/baiduFanyi/common", function(req, res) {
//     const doTrans = require("./modules/baiduFanyi/common")
//     doTrans(req, res, "post")
// })


var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});