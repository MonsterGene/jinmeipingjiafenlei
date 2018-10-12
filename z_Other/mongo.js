var mongoClient = require("mongodb").MongoClient
var url = "mongodb://127.0.0.1:27017"
var closeDB = function(db){
    db.close()
}
mongoClient.connect(url,function(err,db){
    if(err) throw err
    console.log("数据库已连接！")
    var dbase = db.db("test")
    dbase.createCollection("test2",function(err,res){
        if(err) throw err
        console.log("创建集合！")
        closeDB(db)
    })
})