const typeListModel = require("../models/typeList")
const DBInit = require("../DBInit")

const mongoose = DBInit.mongoose
const DBConn = DBInit.conn
module.exports = {
    getTypeList:function(req,res){
        DBConn()
        typeListModel.find({},function(err,docs){
            if(err){
                res.send(JSON.stringify({success:false,errMsg:{type:err.name,msg:err.message}}))
            }else{
                res.send(JSON.stringify({success:true,data:docs}))
            }
        })
    },
    setType:function(req,res){
        DBConn()
        console.log(req.body)
        const conditions = {
            _id:mongoose.Types.ObjectId(req.body._id)
        }
        const updates = {
            $set:{
                code:req.body.code,
                desc:req.body.desc
            }
        }
        typeListModel.update(conditions,updates,function(err){
            console.log(arguments)
            if(err){
                res.send(JSON.stringify({success:false,errMsg:{type:err.name,msg:err.message}}))
            }else{
                res.send(JSON.stringify({success:true}))
            }
        })
    },
    addType:function(req,res){
        DBConn()
        console.log(req.body)
        typeListModel.create(req.body,function(err,doc){
            console.log(arguments)
            if(err){
                res.send(JSON.stringify({success:false,errMsg:{type:err.name,msg:err.message}}))
            }else{
                res.send(JSON.stringify({success:true,data:doc}))
            }
        })
    },
    delType:function(req,res){
        console.log(req.body)
        DBConn()
        const id=mongoose.Types.ObjectId(req.body._id)
        typeListModel.remove({_id:id},function(err,result){
            console.log(arguments)
            if(err){
                res.send(JSON.stringify({success:false,errMsg:{type:err.name,msg:err.message}}))
            }else{
                res.send(JSON.stringify({success:true}))
            }
        })
    }
}