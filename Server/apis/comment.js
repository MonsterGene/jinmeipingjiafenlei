const DBConn = require("../functions/DBInit")
const commentModel = require("../database/models/comment")
const commentFileModel = require("../database/models/commentFile")
const iconsole = require("../functions/logs")

const mongoose = DBConn.mongoose

module.exports = {
	select:function(req,res){/** 获取评价列表,参数：fileId */
		DBConn.conn()
		commentModel.find({fromFileId:req.body.fileId},function(err,docs){
			if(err){
				iconsole.sendErr(err)
			}else{
				res.json({success:true,data:docs})
			}
		})
	},
	update:function(req,res){/** 更新评价,参数：评价_id，要更新的内容：update */
		DBConn.conn()
		const commentId = mongoose.Types.ObjectId(req.body._id)
		// 更新评价
		commentModel.updateOne({_id:commentId},{
			$set:req.body.update
		},function(err,result){
			if(err){
				iconsole.sendErr("数据更新失败！")
			}else{
				// 更新待评价数量
				commentModel.count({fromFileId:req.body.fileId,firstType:""},function(err,count){
					if(err){
						iconsole.log({title:"count comments error",message:arguments})
					}else{
						const fileObjId = mongoose.Types.ObjectId(req.body.fileId)
						commentFileModel.updateOne({_id:fileObjId},{$set:{pending:count}},function(){
							iconsole.log({title:"update file comment count",message:arguments})
						})
					}
				})
				res.json({success:true,data:result})
			}
		})
	}
}
