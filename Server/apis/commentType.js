const commentTypeModel = require("../database/models/commentType")
const DBConn = require("../functions/DBInit")
const iconsole = require("../functions/logs")

const mongoose = DBConn.mongoose

module.exports = {
	select:function(req,res){/** 获取类别列表 */
		DBConn.conn()
		commentTypeModel.find({},function(err,docs){
			if(err){
				iconsole.sendErr(res,err)
				iconsole.log({title:"select commenttype error"})
			}else{
				res.json({success:true,data:docs})
			}
		})
	},
	update:function(req,res){
		DBConn.conn()
		const _idObjId = mongoose.Types.ObjectId(req.body._id)
		commentTypeModel.update({_id:_idObjId},req.body.update,function(err){
			if(err){
				iconsole.sendErr(res,err)
			}else{
				res.json({success:true})
			}
		})
	},
	insert:function(req,res){
		DBConn.conn()
		commentTypeModel.create(req.body,function(err,doc){
			if(err){
				iconsole.sendErr(res,err)
			}else{
				res.json({success:true,data:doc})
			}
		})
	},
	delete:function(req,res){
		DBConn.conn()
		const _idObjId = mongoose.Types.ObjectId(req.body._id)
		commentTypeModel.remove({_id:_idObjId},function(err,result){
			if(err){
				iconsole.sendErr(res,err)
			}else{
				res.json({success:true})
			}
		})
	}
}
