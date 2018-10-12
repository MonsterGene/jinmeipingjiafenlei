var express = require('express');


proccessArg = process.argv.slice(2).reduce((acc, cur) => {
    [key, val] = cur.split("=")
    acc[key] = val
    return acc
}, {})
const config = global.global.appConfig = {}
config.uploadPath = "uploads"
config.isServer = !(proccessArg.node_env==="dev")
if(proccessArg.node_env==="dev"){
	config.serverPort = 3000
}else{
	config.serverPort = 80
}

var router = require("./routes/main")
var app = express()
app.use(router)
var server = app.listen(config.serverPort,function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port)
})