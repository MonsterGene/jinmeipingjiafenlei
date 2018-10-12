const fs = require("fs")
const path = require("path")
const xlsx = require("xlsx")

const DBConn = require("../../functions/DBInit")
const commentFileModel = require("../../database/models/commentFile")
const commentModel = require("../../database/models/comment")
const iconsole = require("../../functions/logs")

const mongoose = DBConn.mongoose

module.exports = {
	select:function(req,res){/** 获取文件列表 */
		DBConn.conn()
		commentFileModel.find({},function(err,docs){
			if(err){
				iconsole.sendErr(res,err)
			}else{
				res.json({success:true,data:docs})
			}
		})
	},
	upload:function(req,res){
		const fileInfo = req.file

		fs.readFile(fileInfo.path,"binary",(err,fileData)=>{
			try {
				fs.unlinkSync(fileInfo.path)
			} catch (err) {
				iconsole.log({title:"delete file error "+fileInfo.originalname,message:err})
			}
			if(err){
				iconsole.log({title:"Read File Error",message:err})
				iconsole.sendErr("文件读取失败！")
				return
			}
			const workbook = xlsx.read(fileData,{type:"binary"})
			const sheet = workbook.Sheets[workbook.SheetNames[0]]
			const sheetRowsRange = (sheet["!ref"] && sheet["!ref"].split(":") || ["A1", "A1"]).map(v => Number(v.match(/\d+/)[0]))
			const sheetColumns = Object.keys(sheet)
				.filter(v => v[0] !== "!")
				.map(v => v.match(/[A-Z]+/)[0])
				.reduce((acc,cur) => {
					if(acc.indexOf(cur)===-1) acc.push(cur)
					return acc
				},[])
				.sort()
				.map(v => {
					const i = sheetRowsRange[0]
					const t = sheet[v + i]
					return {
						title: t && t.v || "",
						key: v
					}
				})
			let sheetData = []
			let pending = 0
			for(let i = sheetRowsRange[0]+1; i <= sheetRowsRange[1];i++){
				sheetData.push(sheetColumns.reduce((acc,cur)=>{
					acc[cur.key] = sheet[cur.key+i] && sheet[cur.key+i].v||""
					return acc
				},{}))
			}
			const sheetHead = {
				sellerAccount:     {title:"账号",key:null},
				buyerAccount:      {title:"买家账号",key:null},
				originComment:     {title:"差评内容",key:null},
				translatedComment: {title:"译文",key:null},
				commentTime:       {title:"评价时间",key:null},
				produce:           {title:"产品",key:null},
				price:             {title:"单价",key:null},
				firstType:         {title:"归类1",key:null},
				secondType:        {title:"归类2",key:null},
				remark:            {title:"备注",key:null},
			}
			let pass = true
			Object.keys(sheetHead).forEach((v,i,arr)=>{
				let k = sheetColumns.filter(_v=>_v.title===sheetHead[v].title)
				if(k.length>0){
					sheetHead[v].key = k[0].key
				}else{
					iconsole.sendErr(res,"文件字段异常！请检查上传数据的字段。")
					arr.splice(i)
					pass = false
				}
			})
			if(!pass) return
			sheetData = sheetData && sheetData.map(v=>{
				if(v.H === "") pending++
				return ({
					sellerAccount:     v[sheetHead.sellerAccount.key],
					buyerAccount:      v[sheetHead.buyerAccount.key],
					originComment:     v[sheetHead.originComment.key],
					translatedComment: v[sheetHead.translatedComment.key],
					commentTime:       v[sheetHead.commentTime.key],
					produce:           v[sheetHead.produce.key],
					price:             v[sheetHead.price.key],
					firstType:         v[sheetHead.firstType.key],
					secondType:        v[sheetHead.secondType.key],
					remark:            v[sheetHead.remark.key],
					fromFileId:        "",
					fromFileName:      fileInfo.originalname
				})
			})||[]
			DBConn.conn()
			commentFileModel.create(Object.assign({},{pending,total:sheetData.length},req.file),function(err,fileDocs){
				if(err){
					iconsole.sendErr(res,err)
					iconsole.log({title:"insert file error",message:err})
				}else{
					sheetData = sheetData.map(v=>{
						v.fromFileId = fileDocs._id
						return v
					})
					commentModel.create(sheetData,function(err,commDocs){
						if(err){
							iconsole.log({title:"insert comments error",message:err})
							iconsole.sendErr(res,"数据导入失败！")
						}else{
							res.json({success:true,data:fileDocs})
						}
					})
				}
			})
			
		})
	},
	delete:function(req,res){/** 删除评价列表 参数:文件_id */
		const delObjId = mongoose.Types.ObjectId(req.body._id)
		commentFileModel.deleteOne({_id:delObjId},function(err,result){
			if(err){
				iconsole.log({title:"delete file error",message:arguments})
				iconsole.sendErr(res,err)
			}else{
				commentModel.deleteMany({fromFileId:req.body._id},function(err,result){
					if(err){
						iconsole.sendErr(res,{name:err.name,message:err.message})
					}else{
						res.send({success:true,data:result})
					}
				})
			}
		})
	}
}