module.exports = function(ajax,serverAddr,opts,success,error){
	ajax({
		url:serverAddr+"/api/translate",
		type:"POST",
		data:{
			q:opts.q,
			from:opts.from,
			to:opts.to
		},
		dataType:"JSON",
		success,
		error
	})
}