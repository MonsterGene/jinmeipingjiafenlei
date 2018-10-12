const http = require("http")
const querystring = require("querystring")
const md5 = require("md5")
const DBInit = require("../../DBInit")
const transCounter = require("../../models/translateCounter")
const moment = require("moment")

const appid = "20180925000211511"
const key = "mu02xzU9HBr4A5X3GYqk"
const apiUrl = "http://api.fanyi.baidu.com/api/trans/vip/translate"

const mongoose = DBInit.mongoose
const DBConn = DBInit.conn

const fanyi = async function(req,res,method){
	DBConn()

	const query = {}
	console.log(req.body)
	if(req.body.query.length>3000){
		res.json({success:false,errMsg:"原文长度太长，请缩减长度！"})
	}
	query.q = req.body.query
	query.from = req.body.from
	query.to = req.body.to
	query.appid = appid
	query.salt = Date.now()
	query.sign = md5(appid+req.body.query+query.salt+key)
	const queryStr = querystring.stringify(query)
	console.log(queryStr)
	
	if(await transCounter.getWordCount()>1900000){
		res.json({success:false,errMsg:"当月翻译额度不足，请联系管理员或下月再来，谢谢！"})
		return 
	}
	var cli = http.request({
		host:"10.191.131.156",
		port:3128,
		method:"POST",
		path:apiUrl,
		headers:{
			// "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			"Proxy-Authorization":"Basic RjEzMzE4NjU6Rm94Y29ubjE2OCEh"
		}
	},function(sres){
		var resTxt = ""
		sres.on("data",function(data){
			resTxt += data
		})
		sres.on("end",function(){
			console.log(resTxt)
			resTxt = JSON.parse(resTxt)
			if(typeof resTxt.error_code!=="undefined"){
				res.json({success:false,data:resTxt})
			}else{
				res.json({success:true,data:resTxt})
			}
			
			console.log("request end")
			transCounter.countWords(query.q,function(err){
				console.log("-------counter-------")
				console.log(arguments)
				console.log("+++++++++++++++++++++")
			})
		})
	}).on("error",function(e){
		res.status(500).json(e)
		console.log(e)
	})
	cli.write(queryStr)
	cli.end()
}

module.exports = fanyi
