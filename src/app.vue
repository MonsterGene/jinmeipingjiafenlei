<template>
<div class="layout" style="height:100%">
    <Layout style="height:100%">
        <Sider breakpoint="md" :hide-trigger="true" collapsible :collapsed-width="78" v-model="isCollapsed">
            <Menu active-name="1-2" theme="dark" :open-names="['1']" accordion width="auto">
                <Submenu name="1">
                    <template slot="title">
                        <Icon type="ios-paper" />
                        内容管理
                    </template>
                    <MenuItem name="1-1">文章管理</MenuItem>
                    <MenuItem name="1-2">评论管理</MenuItem>
                    <MenuItem name="1-3">举报管理</MenuItem>
                </Submenu>
                <Submenu name="2">
                    <template slot="title">
                        <Icon type="ios-people" />
                        用户管理
                    </template>
                    <MenuItem name="2-1">新增用户</MenuItem>
                    <MenuItem name="2-2">活跃用户</MenuItem>
                </Submenu>
                <Submenu name="3">
                    <template slot="title">
                        <Icon type="ios-stats" />
                        统计分析
                    </template>
                    <MenuGroup title="使用">
                        <MenuItem name="3-1">新增和启动</MenuItem>
                        <MenuItem name="3-2">活跃分析</MenuItem>
                        <MenuItem name="3-3">时段分析</MenuItem>
                    </MenuGroup>
                    <MenuGroup title="留存">
                        <MenuItem name="3-4">用户留存</MenuItem>
                        <MenuItem name="3-5">流失用户</MenuItem>
                    </MenuGroup>
                </Submenu>
            </Menu>
        </Sider>
        <Layout>
            <Header class="layout-header-bar">
                <Icon @click.native="isCollapsed=!isCollapsed" :style="{margin: '0 20px',marginLeft:'-30px'}" type="md-menu" size="24"></Icon>
                Header
            </Header>
            <Content :style="{margin: '20px', background: '#fff',height:'100%',overflow:'auto'}">
                <Button class="fileInput" type="primary" :loading="loading" size="default">
                    选择文件
                    <input @change="fileChange" type="file" accept=".xls,.xlsx" />
                </Button>
                <span>{{ file&&file.name||"" }}</span>
                <span>{{ sheetsData&&sheetsData[curSheetName].data.length||0 }}</span>
                <Upload action="http://127.0.0.1:3000/fileUpload" accept=".xls,xlsx">
                    <Button icon="ios-cloud-upload-outline" size="default">Upload files</Button>
                </Upload>
                <Progress v-if="progress" :percent="progressValue"></Progress>
                <Tabs class="app-tabs-xlsx" v-if="sheetNames.length>0" v-model="curSheetName" style="height:calc(100% - 35px)">
                    <TabPane v-for="name in sheetNames" :key="name" :label="name" :name="name">
                        <Table
                            v-once
                            size="default"
                            :columns="sheetsData[name].columns"
                            :data="sheetsData[name].data"
                            height="1000"
                            style="height:100%;"
                        ></Table>
                    </TabPane>
                </Tabs>
            </Content>
        </Layout>
    </Layout>
</div>
</template>
<script>
import XLSX from "xlsx"
import {Layout,Sider,Menu,Submenu,MenuGroup,MenuItem,Icon,Header,Content,Button,
    Progress,Tabs,TabPane,Table,Upload
} from "iview"
import "iview/dist/styles/iview.css"
let workbook = null
export default {
    components:{
        Layout,Sider,Menu,Submenu,MenuGroup,MenuItem,Icon,Header,Content,Button,
        Progress,Tabs,TabPane:Tabs.Pane,TabPane,Table,Upload
    },
    data(){
        const data = {
            isCollapsed:false,
            file:null,
            loading:false,
            progress:false,
            progressValue:0,
            curSheetName:null,
            sheetNames:[],
            reader: new FileReader(),
            jquery:this.$root.jquery
        }
        data.reader.onloadstart = (e)=>{
            this.loading = true
            this.progress = true
            this.$forceUpdate()
            console.log("start")
        }
        data.reader.onloadend = (e)=>{
            setTimeout(()=>{
                this.progressValue = 0
                this.progress = false
            },1500)
            console.log("end")
        }
        data.reader.onprogress = (e)=>{
            this.$set(data,"progressValue",Number(((e.loaded/e.total)*100).toFixed(2)))
            console.log(e)
        }
        return data
    },
    watch:{
        progressValue(){
            console.log(arguments)
        }
    },
    computed:{
        menuitemClasses(){
            return [
                'menu-item',
                this.isCollapsed ? 'collapsed-menu' : ''
            ]
        },
        sheetsData(){
            if(this.sheetNames.length>0){
                const data = {}
                this.sheetNames.forEach(v=>{
                    data[v] = {columns:[],data:[]}
                    let sheet = workbook.Sheets[v]
                    const sheetRowsRange = (sheet["!ref"]&&sheet["!ref"].split(":")||["A1","A1"]).map(v=>Number(v.match(/\d+/)[0]))
                    data[v].columns = (Object.keys(sheet)
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
                        data[v].columns.forEach(v=>{
                            row[v.key] = sheet[v.key+i]&&sheet[v.key+i].v||""
                        })
                        data[v].data.push(row)
                    }
                    console.log(data[v].data.length)
                    sheet = null
                })
                workbook = null
                
                return data
            }else{
                return null
            }
        }
    },
    methods:{
        fileChange(e){
            // console.log(e.target)
            this.progress = true
            this.$nextTick(()=>{
                if(e.target.files.length>0){
                    this.file = e.target.files[0]
                }else{
                    this.file = null
                    return false
                }
                this.reader.onload = (e)=>{
                    console.log("loaded")
                    var data = e.target.result
                    this.progress = true
                    workbook = XLSX.read(data,{type:"binary"})
                    this.sheetNames = workbook.SheetNames
                    this.curSheetName = this.sheetNames[0]
                    // console.log(workbook)
                    console.log("loaded2")
                    this.loading = false
                }
                this.reader.readAsBinaryString(this.file)
            })
            
        }
    }
}
</script>
<style lang="stylus" scoped>
.fileInput
    position relative

.fileInput input
    position absolute
    font-size 0
    width 100%
    height 100%
    right 0
    top 0
    opacity 0

.layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
}
.layout-header-bar{
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,.1);
}
.menu-item span{
    display: inline-block;
    overflow: hidden;
    width: 69px;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: width .2s ease .2s;
}
.menu-item i{
    transform: translateX(0px);
    transition: font-size .2s ease, transform .2s ease;
    vertical-align: middle;
    font-size: 16px;
}
.collapsed-menu span{
    width: 0px;
    transition: width .2s ease;
}
.collapsed-menu i{
    transform: translateX(5px);
    transition: font-size .2s ease .2s, transform .2s ease .2s;
    vertical-align: middle;
    font-size: 22px;
}

    
</style>
<style lang="stylus">
.app-tabs-xlsx .ivu-tabs-content
    height calc(100% - 55px)
.app-tabs-xlsx .ivu-table-body
    height calc(100% - 40px)!important

</style>



