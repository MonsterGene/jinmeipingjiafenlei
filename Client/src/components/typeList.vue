<template>
<div style="height:100%">
    <Table ref="typeTable" border size="default" stripe :columns="table.columns" :data="table.data" height="300" style="height:100%">
        <div slot="footer" style="width:100%;overflow:hidden">

            <Button type="primary" size="default" @click="exportData(1)" style="margin-left:5px">
                <Icon type="ios-download-outline"></Icon>
                导出所有数据
            </Button>
            <Button type="primary" size="default" @click="exportData(2)" style="margin-left:5px">
                <Icon type="ios-download-outline"></Icon>
                导出筛选后数据
            </Button>
            <Button type="success" size="default" @click="addType" style="float:right;margin-top:8px;margin-right:5px">
                <Icon type="md-add"></Icon>
            </Button>
        </div>
    </Table>
    <Modal
        v-model="editRow"
        :transfer="false"
        :loading="true"
        :mask-closable="false"
        title="编辑分类"
        @on-ok="handleRowSubmit('rowEditForm')"
        @on-visible-change="rowEditModalChange"
    >
        <Form
            ref="rowEditForm"
            :model="rowField"
            :rules="rowRules"
            inline
            style="overflow:hidden"
        >
            <FormItem prop="code" label="类别：" :label-width=50 style="width:150px;float:left">
                <Input type="text" v-model="rowField.code" placeholder="输入类别..." size="default" />
            </FormItem>
            <FormItem prop="desc" label="说明：" :label-width=50 style="width:calc(100% - 170px);float:left">
                <Input type="text" v-model="rowField.desc" placeholder="输入说明文字..." size="default" />
            </FormItem>
        </Form>
    </Modal>
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
        </div>
        <div slot="footer">
            <Button type="error" size="large" long :loading="delLoading" @click="delType">Delete</Button>
        </div>
    </Modal>
</div>
</template>
<script>

export default {
    data(){
        const data = {}
        data.jquery = this.$root.jquery
        data.table = {
            columns:[],
            data:[]
        }
        data.table.columns = [
            {title:"类别",key:"code",width:100,align:"center"},
            {title:"描述",key:"desc"},
            {
                title:'操作',
                width:130,
                render:(h,info)=>{
                    return h("div",[
                        h("Button",{
                            props:{
                                type:"primary",
                                size:"small"
                            },
                            on:{
                                click:()=>{
                                    console.log(info)
                                    this.editRow = true
                                    this.edittingRow = info.row
                                }
                            }
                        },"编辑"),
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
                                    this.del_id = info.row._id
                                    // Modal.warning({title:"删除？",desc:"确定要删除这个类别吗？"})
                                }
                            }
                        },"删除")
                    ])
                }
            }
        ]
        data.notice = this.$root.notice
        data.editRow = false
        data.edittingRow = {}
        data.rowField = {
            code:"",
            desc:""
        }
        data.rowRules = {
            code:{
                required:true,
                message:"请输入类别",
                trigger:"blur"
            },
            code:{required:false}
        }
        data.delModal = false
        data.del_id = null
        data.delLoading = false

        return data
    },
    methods:{
        addType(){
            this.editRow = true
        },
        rowEditModalChange(show){
            this.rowField.code = show&&this.edittingRow.code||""
            this.rowField.desc = show&&this.edittingRow.desc||""
            if(!show) this.edittingRow = {}
        },
        handleRowSubmit(formRef){
            const vm = this
            this.$refs[formRef].validate((valid)=>{
                if(valid){
                    let subData
                    if(this.edittingRow._id){
                        subData = Object.assign({_id:this.edittingRow._id},{update:this.rowField})
                    }else{
                        subData = this.rowField
                    }
                    this.jquery.ajax({
                        url:this.$root.serverAddr+"/api/CommentType"+(this.edittingRow._id?"/update":"/insert"),
                        type:"POST",
                        data:subData,
                        dataType:"json",
                        success(data){
                            if(data.success){
                                vm.edittingRow.code = vm.rowField.code
                                vm.edittingRow.desc = vm.rowField.desc
                                if(!vm.edittingRow._id){
                                    vm.edittingRow._id = data.data._id
                                    vm.table.data.push(vm.edittingRow)
                                }
                                
                                vm.notice.success({title:"成功",desc:"保存类别成功！"})
                            }else{
                                vm.notice.warning({title:"失败",desc:"保存类别失败！"})
                            }
                            vm.editRow = false
                            console.log(data)
                        },
                        error(xhr){
                            console.log(xhr)
                            vm.editRow = false
                            vm.notice.error({title:"错误",desc:"保存类别失败！可能是网络或服务器出错了。"})
                        }
                    })
                    
                }else{
                    this.notice.error({title:"错误",desc:"数据验证失败！"})
                }
            })
        },
        delType(){
            this.delLoading = true
            const vm = this
            this.jquery.ajax({
                url:this.$root.serverAddr+"/api/CommentType/delete",
                type:"POST",
                data:{_id:this.del_id},
                dataType:"JSON",
                success(data){
                    vm.delLoading = false
                    vm.delModal = false
                    if(data.success){
                        vm.table.data = vm.table.data.filter(v=>v._id!==vm.del_id)
                        this.del_id = null
                        vm.notice.success({title:"成功",desc:"删除类别成功！"})
                    }else{
                        vm.notice.warning({title:"失败",desc:"删除类别失败！请稍后再试。"})
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
                this.$refs.typeTable.exportCsv({
                    filename: '评价类别'
                });
            } else if (type === 2) {
                this.$refs.typeTable.exportCsv({
                    filename: '评价类别',
                    original: false
                });
            }
        }
    },
    mounted(){
        const vm = this
        //load table data
        this.jquery.ajax({
            url:this.$root.serverAddr+"/api/CommentType/select",
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
.ivu-table
    height 100%
.ivu-table-wrapper .ivu-table-body
    height calc(100% - 88px)!important
</style>
<style lang="stylus" scoped>

</style>


