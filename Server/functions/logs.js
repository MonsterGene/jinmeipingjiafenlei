const logMsg = function(opts){
	console.log("------"+opts.title+"------")
	console.log(opts.message)
	console.log("".padEnd(12+opts.title.length,"-"))
}
const sendErr = function(res,err){
	if(typeof err==="string"){
		res.json({success:false,errMsg:err})
	}else{
		res.json({success:false,errMsg:{type:err.name,msg:err.message}})
	}
}
module.exports = {
	log:logMsg,
	sendErr
}