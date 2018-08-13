const fs = require("fs")
const XLSX = require("xlsx")

const def = function(req,res){
    console.log(req.body)
    console.log(req.files)
    const data = {}
    data.sheets = {}
    fs.readFile(req.files[0].path,"binary",(err,fileData)=>{
        if(err) return 
        let workbook = XLSX.read(fileData,{type:"binary"})
        // console.log(workbook)
        data.sheetNames = workbook.SheetNames
        data.sheetNames && data.sheetNames.forEach(v=>{
            data.sheets[v] = {columns:[],data:[]}
            let sheet = workbook.Sheets[v]
            const sheetRowsRange = (sheet["!ref"]&&sheet["!ref"].split(":")||["A1","A1"]).map(v=>Number(v.match(/\d+/)[0]))
            data.sheets[v].columns = (Object.keys(sheet)
                .filter(v=>v[0]!=="!")
                .map(v=>v.match(/[A-Z]+/)[0])
                .reduce((ac,v)=>{if(ac.indexOf(v)===-1) ac.push(v);return ac},[])
                .sort()
                .map(v=>{
                    const i = sheetRowsRange[0]
                    const t = sheet[v+i]
                    return {title:t&&t.v||"",key:v}
                }))
            // const sheetRowsCount = sheetRowsRange[1]-sheetRowsRange[0]+1
            // console.log(sheetRowsRange,sheetRowsCount)
            for(let i=sheetRowsRange[0]+1;i<=sheetRowsRange[1];i++){
                const row = {}
                data.sheets[v].columns.forEach(v=>{
                    row[v.key] = sheet[v.key+i]&&sheet[v.key+i].v||""
                })
                data.sheets[v].data.push(row)
            }
            console.log(data.sheets[v].data.length)
            sheet = null
        })
        workbook = null
        res.send(JSON.stringify(data));
    })
    
}

module.exports = def