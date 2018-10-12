const fs = require("fs")
const path = require("path")
const xlsx = require("xlsx")


const DBInit = require("../DBInit")
const fileListModel = require("../models/fileModal")
const pingjiaListModel = require("../models/pingjiaList")

const mongoose = DBInit.mongoose
const DBConn = DBInit.conn
module.exports = {
    getFileList: function(req, res) {
        DBConn()

        fileListModel.find({}, function(err, docs) {
            console.log(arguments)
            if (err) {
                res.json({ success: false, errMsg: { type: err.name, msg: err.message } })
            } else {
                res.json({ success: true, data: docs })
            }
        })
    },
    dataUpload: function(req, res) {
        DBConn()
        console.log(req.body)
        console.log(req.file)
        const fileInfo = req.file
        const tmpFileId = fileInfo.filename

        fs.readFile(fileInfo.path, "binary", (err, fileData) => {
            if (err) {
                console.log("------Read File Error-----")
                console.log(err)
                console.log("--------------------------")
                res.json({ success: false, errMsg: "文件读取失败！" })
                return
            }
            let processCount = 0
            let processSum = 2
            const processResult = function() {
                if (++processCount === processSum) {
                    res.json(resData)
                }
            }
            let workbook = xlsx.read(fileData, { type: "binary" })
            let sendData = {}
            const resData = {
                success: true,
                data: {
                    saveData: {
                        success: false
                    },
                    saveFile: {
                        success: false
                    }
                }
            }

            sendData.sheetNames = workbook.SheetNames
            sendData.sheets = {}
            sendData.sheetNames && sendData.sheetNames.forEach(v => {
                sendData.sheets[v] = { columns: [], data: [] }
                const sheet = workbook.Sheets[v]
                const sheetRowsRange = (sheet["!ref"] && sheet["!ref"].split(":") || ["A1", "A1"]).map(v => Number(v.match(/\d+/)[0]))
                sendData.sheets[v].columns = Object.keys(sheet)
                    .filter(v => v[0] !== "!")
                    .map(v => v.match(/[A-Z]+/)[0])
                    .reduce((ac, v) => { if (ac.indexOf(v) === -1) ac.push(v); return ac }, [])
                    .sort()
                    .map(v => {
                        const i = sheetRowsRange[0]
                        const t = sheet[v + i]
                        return { title: t && t.v || "", key: v }
                    })
                for (
                    let i = sheetRowsRange[0] + 1; i <= sheetRowsRange[1]; i++
                ) {
                    const row = {}
                    sendData.sheets[v].columns.forEach(v => {
                        row[v.key] = sheet[v.key + i] && sheet[v.key + i].v || ""
                    })
                    sendData.sheets[v].data.push(row)
                }
            })
            const data = sendData.sheets[sendData.sheetNames[0]].data
            const typeState = {
                pending: 0
            }
            const saveData = data && data.map(v => {
                if (v.H === "")
                    typeState.pending++
                    return ({
                        sUName: v.A,
                        bUName: v.C,
                        originContent: v.B,
                        translatedText: v.J,
                        pjTime: v.D,
                        produce: v.E,
                        price: v.F,
                        firstType: v.H,
                        secondType: v.I,
                        mark: v.G,
                        fromFileName: fileInfo.originalname,
                        fromFileId: tmpFileId
                    })
            }) || []
            console.log(typeState)
            pingjiaListModel.create(saveData, function(err, docs) {
                // console.log(arguments)
                if (err) {
                    resData.data.saveData.success = false
                    resData.data.saveData.errMsg = { type: err.name, msg: err.message }
                } else {
                    resData.data.saveData.success = true
                }
				processResult()
				let fileName = path.parse(fileInfo.originalname)
				fileName = path.join(global.global.uploadPath, fileName.name + Date.now().toString() + fileName.ext)
				fs.rename(
					fileInfo.path,
					fileName,
					function(err) {
						console.log(arguments)
						if (err) {
							resData.data.saveFile.success = false
							try {
								fs.unlinkSync(fileInfo.path)
							} catch (err) {
								console.log("delete file fail!")
								console.log(err)
							}
							resData.data.saveFile.errMsg = { type: err.name, msg: err.message }

							processResult()
						} else {
							req.file.path = fileName
							fileListModel.create(Object.assign({}, typeState, req.file), function(err, doc) {
								if (err) {
									resData.data.saveFile.success = false
									resData.data.saveFile.errMsg = { type: err.name, msg: err.message }
									processResult()
								} else {
									resData.data.saveFile.success = true
									resData.data.saveFile.data = doc
									if (req.body.saveData) {
										// processSum++
										console.log(tmpFileId)
										pingjiaListModel.update({ fromFileId: tmpFileId }, { $set: { fromFileId: doc._id } }, { multi: true },
											function(err, result) {
												console.log(arguments)
												if (err) {
													resData.data.saveFile.message = "更新fileId到数据表中失败。"
												} else {
													resData.data.saveFile.updateFileId = result
												}
												processResult()
											}
										)
									} else {
										processResult()
									}
								}
							})
						}
					}
				)
            })
            
        })
    },
    delFile: function(req, res) {
        DBConn()
        console.log(req.body)
        const resData = {
            success: true,
            data: {
                delFile: {
                    success: false
                },
                delFileAtDB: {
                    success: false
                },
                delDBData: {
                    success: false
                }
            }
        }
        const del_id = mongoose.Types.ObjectId(req.body._id)
        try {
            fs.unlinkSync(req.body.filePath)
            resData.data.delFile.success = true
        } catch (err) {
            resData.data.delFile.errMsg = err.message
        }
        let wait = 2
        fileListModel.deleteOne({ _id: del_id }, function(err) {
            if (err) {
                resData.data.delFileAtDB.errMsg = { name: err.name, message: err.message }
            } else {
                resData.data.delFileAtDB.success = true
            }
            if (--wait === 0) {
                res.json(resData)
                wait = -1
            }
        })
        if (req.body.delDBData) {
            pingjiaListModel.deleteMany({ fromFileId: req.body._id }, function(err, result) {
                if (err) {
                    resData.data.delDBData.errMsg = { name: err.name, message: err.message }
                } else {
                    resData.data.delDBData.success = true
                    resData.data.delDBData.data = result

                }
                if (--wait === 0) {
                    res.json(resData)
                    wait = -1
                }
            })
        }

    },
    getEvalList: function(req, res) {
        DBConn()
        pingjiaListModel.find({ fromFileId: req.body.fileId }, function(err, docs) {
            console.log(arguments)
            if (err) {
                res.json({ success: false, errMsg: { type: err.name, msg: err.message } })
            } else {
                res.json({ success: true, data: docs })
            }
        })
    },
    updateEvalType: function(req, res) {
        DBConn()
        const evalId = mongoose.Types.ObjectId(req.body._id)
        pingjiaListModel.updateOne({ _id: evalId }, {
            $set: {
                firstType: req.body.firstType,
                secondType: req.body.secondType,
                mark: req.body.mark
            }
        }, function(err, result) {
            console.log(arguments)
            if (err) {
                return res.json({ success: false, errMsg: "数据更新失败！" })
            } else {
                pingjiaListModel.count({ fromFileId: req.body.fileId, firstType: "" }, function(err, count) {
                    console.log("---------count---------")
                    console.log(arguments)
                    console.log("+++++++++++++++++++++++")
                    if (!err) {
                        const fileDBId = mongoose.Types.ObjectId(req.body.fileId)
                        fileListModel.updateOne({ _id: fileDBId }, { $set: { pending: count } }, function() {
                            console.log(arguments)
                        })
                    }

                })
                return res.json({ success: true, data: result })
            }
        })
    },
    updateEval: function(req, res) {
        DBConn()
        console.log(req.body)
        const evalId = mongoose.Types.ObjectId(req.body._id)
        pingjiaListModel.updateOne({ _id: evalId }, { $set: req.body.updateData }, function(err, result) {
            console.log(arguments)
            if (err) {
                return res.json({ success: false, errMsg: "数据更新失败！" })
            } else {
                if ("firstType" in req.body.updateData) {
                    pingjiaListModel.count({ fromFileId: req.body.fileId, firstType: "" }, function(err, count) {
                        console.log("---------count---------")
                        console.log(arguments)
                        console.log("+++++++++++++++++++++++")
                        if (!err) {
                            const fileDBId = mongoose.Types.ObjectId(req.body.fileId)
                            fileListModel.updateOne({ _id: fileDBId }, { $set: { pending: count } }, function() {
                                console.log(arguments)
                            })
                        }

                    })
                }
                return res.json({ success: true, data: result })
            }
        })
    }
}