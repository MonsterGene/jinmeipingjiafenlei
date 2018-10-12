/**
 * 路由配置
 */

var express = require("express")
var router = express.Router()

var multer = require("multer") //用于上传文件
var bodyParser = require("body-parser") //解析请求体
var historyApiFallback = require("connect-history-api-fallback") //404重定向

var upload = multer({ dest: appConfig.uploadPath })

router.use(historyApiFallback()) // 404重定向
router.use(express.static("views")) // 静态资源
router.use("*", function(req, res, next) { // 跨域处理
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})
router.use(bodyParser.urlencoded()) // 请求体解析

//insert,delete,select,update,upload,download
/** 文件上传 */
const commentFileApi = require("../apis/files/commentFile.js")

// 文件处理路由
const fileRoutes = {
	comment: commentFileApi
}
router.route("/api/file/:type/:action")
    .post(
        upload.single("commentFile"),
        function(req, res) {
			fileRoutes[req.params.type][req.params.action](req, res)
        }
    )

// 评价类别
const commentTypeApi = require("../apis/commentType.js")
router.route("/api/CommentType/:action")
	.post(function(req,res){
		commentTypeApi[req.params.action](req,res)
	})

// 评价数据
const commentApi = require("../apis/comment.js")
router.route("/api/comment/:action")
	.post(function(req,res){
		commentApi[req.params.action](req,res)
	})

// 翻译 参数：q,from,to
const translateApi = require("../apis/translate.js")
router.post("/api/translate",function(req,res){
	translateApi(req,res)
})

module.exports = router


