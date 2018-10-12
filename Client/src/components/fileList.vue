<template>
<div id="fileList" style="height:100%">
    <Table ref="fileTable" border size="default" stripe :columns="table.columns" :data="table.data" height="300" style="height:100%">
        <div slot="footer" style="width:100%;overflow:hidden">
            <Button type="primary" size="default" @click="exportData(1)" style="margin-left:5px">
                <Icon type="ios-download-outline"></Icon>
                导出所有数据
            </Button>
            <Button type="primary" size="default" @click="exportData(2)" style="margin-left:5px">
                <Icon type="ios-download-outline"></Icon>
                导出筛选后数据
            </Button>
            <Upload
                :action="serverAddr+'/api/file/comment/upload'"
                name="commentFile"
                :data='uploadConfig'
                accept=".xls,xlsx"
                :show-upload-list="false"
                :on-success="uploadSuccess"
				:on-progress="uploadProgress"
                style="width:136px;display:inline-block"
            >
                <Button icon="ios-cloud-upload-outline" size="default">上传并导入数据</Button>
            </Upload>
        </div>
    </Table>
    <Modal
        v-model="delModal"
        width="360"
        :transfer="false"
        :loading="true"
    >
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="ios-information-circle"></Icon>
            <span>删除确认</span>
        </p>
        <div style="text-align:center">
            <p>删除后数据将无法恢复哦。</p>
            <p>确定要删除吗?</p>
            <!-- <Checkbox v-model="delDBData" size="default">一起删除导入的数据</Checkbox> -->
        </div>
        <div slot="footer">
            <Button type="error" size="large" long :loading="delLoading" @click="delFile">删除</Button>
        </div>
    </Modal>
</div>
</template>
<script>
export default {
    data(){
        const data = {}
		const vThis = this
		data.serverAddr = this.$root.serverAddr
        data.jquery = this.$root.jquery
        data.notice = this.$root.notice
        data.table = {
            columns:[],
            data:[]
        }
        data.table.columns = [
            {title:"#",width:80,type:"index",align:"center"},
            {
                title:"文件",
                key:"originalname",
                render:(h,info)=>{
                     return h("div",[
						h("a",{
							on:{
								click:()=>{
									vThis.$root.goRoute("/evaluateList",{fileInfo:info.row})
								}
							},
							style:{
								marginRight:"5px"
							}
						},
						info.row.originalname
						),
						h("Tag",{
							props:{
								color:"cyan"
							}
						},info.row.pending)
					])
                }
            },
            {
                title:'操作',
                width:130,
                render:(h,info)=>{
                    return h("div",[
                        // h(Button,{
                        //     props:{
                        //         type:"primary",
						// 		size:"small",
						// 		disabled:info.row.pending===info.row.finish
                        //     },
                        //     style:{
                        //         marginLeft:"10px"
                        //     },
                        //     on:{
                        //         click:()=>{
                        //             console.log(info)
                        //             this.delModal = true
                        //             this.delFileInfo = info.row
                        //             // Modal.warning({title:"删除？",desc:"确定要删除这个类别吗？"})
                        //         }
                        //     }
                        // },"开始分类"),
                        h("Button",{
                            props:{
                                type:"warning",
                                size:"small"
                            },
                            style:{
                                marginLeft:"10px"
                            },
                            on:{
                                click:()=>{
                                    console.log(info)
                                    this.delModal = true
                                    this.delFileInfo = info.row
                                    // Modal.warning({title:"删除？",desc:"确定要删除这个类别吗？"})
                                }
                            }
                        },"删除")
                    ])
                }
            }
        ]
        data.delModal = false
        data.delFileInfo = null
        // data.delDBData = false
        data.delLoading = false
        data.uploadConfig = {
            getData:false,
            saveData:true,
            getDBData:false,
            saveFile:false
        }
        return data
    },
    methods:{
		uploadProgress(){
			console.log(arguments)
		},
        uploadSuccess(data,upFile,upFileList){
			console.log(arguments)
			if(data.success){
				this.notice.success({title:"成功",desc:"导入数据成功！"})
				this.table.data.push(data.data)
			}else{
				this.notice.warning({title:"失败",desc:typeof data.errMsg==="string"?data.errMsg:"导入数据失败！"})
				console.log(data.errMsg)
			}
        },
        delFile(){
            this.delLoading = true
            const vm = this
            this.jquery.ajax({
                url:this.$root.serverAddr+"/api/file/comment/delete",
                type:"POST",
                data:{
                    _id:this.delFileInfo._id
                },
                dataType:"JSON",
                success(data){
                    vm.delLoading = false
                    vm.delModal = false
                    if(data.success){
                        vm.table.data = vm.table.data.filter(v=>v._id!==vm.delFileInfo._id)
                        vm.delFileInfo = null
                        vm.notice.success({title:"成功",desc:"删除文件成功！"})
                    }else{
                        vm.notice.warning({title:"失败",desc:"删除文件失败！请稍后再试。"})
                    }
                },
                error(xhr){
                    vm.delLoading = false
                    vm.delModal = false
                    vm.notice.error({title:"错误",desc:"网络或服务器出错了。请刷新查看是否删除成功！"})
                }
            })
        },
        exportData (type) {
            if (type === 1) {
                this.$refs.fileTable.exportCsv({
                    filename: '文件列表'
                });
            } else if (type === 2) {
                this.$refs.fileTable.exportCsv({
                    filename: '文件列表',
                    original: false
                });
            }
        }
    },
    mounted(){
        const vm = this
        //load table data
        this.jquery.ajax({
            url:this.$root.serverAddr+"/api/file/comment/select",
            type:"POST",
            dataType:"JSON",
            success(data){
                if(data.success){
                    // vm.$set(vm.table,"data",data.data)
                    vm.table.data = data.data
                }else{
                    vm.notice.error({
                        title:"错误",
                        desc:"类别列表加载失败！"
                    })
                }
                console.log(data)
            },
            error(xhr,errType,err){
                console.log(xhr)
                vm.notice.error({
                    title:"错误",
                    desc:"网络或服务器出错！"
                })
            }

        })

    }
}
</script>
<style lang="stylus">
#fileList
    .ivu-table
        height 100%
    .ivu-table-wrapper .ivu-table-body
        height calc(100% - 88px)!important
</style>
<style lang="stylus" scoped>

</style>


