var mongoose = require("mongoose");

var TestSchema = new mongoose.Schema({
    name:String,
    age:Number,
    time:Date,
    email:String
})

var db = mongoose.connect("mongodb://127.0.0.1:27017/test");

mongoose.connection.on("error", function (error) {
    console.log("数据库连接失败：" + error);
});
mongoose.connection.on("open", function () {
    console.log("------数据库连接成功！------");
    console.log(db)
});

var TestModel = mongoose.model("test3",TestSchema)
//Model添加数据
TestModel.create({name:"test",age:"26"},function(err,docs){
    if(err){
        console.log(err)
    }else{
        console.log(docs)
    }
})
//entity保存数据
var TestEntity = new TestModel({
    name:"Lenka",
    age:36,
    email:"nkzj.2009@163.com"
})
TestEntity.save(function(err,doc){
    console.log(arguments)
})
console.log(TestEntity.name)
console.log(TestEntity.age)

//data update
var conditions = {name:"test"}

var update = {$set:{age:16}}

TestModel.update(conditions,update,function(err){
    console.log(arguments)
    if(err){
        console.log(err)
    }else{
        console.log("Update success!")
    }
})

//data delete
var conditions = {name:"test"}
TestModel.remove(conditions,function(){
    console.log(arguments)
})



