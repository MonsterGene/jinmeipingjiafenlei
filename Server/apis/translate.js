const http = require("http")
const querystring = require("querystring")
const md5 = require("md5")
const DBConn = require("../functions/DBInit")
const translateCounterModel = require("../database/models/translateCounter")
const iconsole = require("../functions/logs")

const mongoose = DBConn.mongoose
const query = {
	appid : "20180925000211511",
	key : "mu02xzU9HBr4A5X3GYqk",
	apiUrl : "http://api.fanyi.baidu.com/api/trans/vip/translate"
}

module.exports = async function(req,res){
	DBConn.conn()
	const rQuery = {}
	Object.assign(rQuery,req.body,{salt:Date.now()},query)
	rQuery.sign = md5(rQuery.appid+rQuery.q+rQuery.salt+rQuery.key)
	
	const queryStr = querystring.stringify(rQuery)
	if(await translateCounterModel.getWordCount()>1900000){
		iconsole.sendErr(res,"当月翻译额度不足，请联系管理员或下月再来，谢谢！")
		return
	}

	const reqOpts = {
		method:"POST",
		path:query.apiUrl,
		headers:{
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		}
	}
	if(appConfig.isServer){
		reqOpts.hostname = "api.fanyi.baidu.com"
		reqOpts.path = "/api/trans/vip/translate"
		reqOpts.headers['Content-Length'] = Buffer.byteLength(queryStr)
	}else{
		reqOpts.host = "10.191.131.156"
		reqOpts.port = 3128
		reqOpts.headers["Proxy-Authorization"] = "Basic RjEzMzE4NjU6Rm94Y29ubjE2OCEh"
	}

	var cli = http.request(reqOpts,function(_res){
		var _resTxt = ""
		_res.on("data",function(data){
			_resTxt += data
		})
		_res.on("end",function(){
			_resTxt = JSON.parse(_resTxt)
			if(typeof _resTxt.error_code!=="undefined"){
				res.json({success:false,errMsg:_resTxt})
			}else{
				res.json({success:true,data:_resTxt})
			}
			translateCounterModel.countWords(rQuery.q,function(err){
				iconsole.log({title:"counter",message:arguments})
			})
		})
	}).on("error",function(err){
		res.status(500).json(e)
		iconsole.log({title:"translate error",message:e})
	})
	cli.write(queryStr)
	cli.end()
}