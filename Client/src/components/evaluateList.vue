<template>
<Card id="evaluateList" style="height:100%;overflow:hidden">
    <div style="height:35px;line-height:30px;padding-bottom:5px">
		<span v-text="fromFileName"></span>
		<div style="display:inline-block;position:absolute;right:16px">
			<!-- <Button type="primary" size="default" @click="translateAll" :loading="transBtnLoading">一键翻译全部</Button> -->
			<Button type="primary" size="default" @click="translateCurPage" :loading="transBtnLoading">一键翻译本页</Button>
			<Form ref="filterForm" :model="filterModel" :rules="filterRules" inline style="display:inline-block">
				<FormItem label="筛选列：" prop="colName" :label-width="75">
					<Select v-model="filterModel.colName" size="default" :transfer="false" clearable style="width:95px">
						<Option
							v-for="item in tableClumns.filter(v=>v.key!==undefined)"
							:key="item.key"
							:value="item.key"
							:label="item.title"
						></Option>
					</Select>
				</FormItem>
				<FormItem prop="kw">
					<Input type="text" size="default" v-model="filterModel.kw" placeholder="关键字" />
				</FormItem>
				<Button type="primary" size="default" @click="doFilter">筛选</Button>
			</Form>	
		</div>
	</div>
    <Table
		ref="evalTable"
        border
        size="default"
        :columns="tableClumns"
        :data="pageData"
        height="1000"
        :loading="tableLoading"
        @on-row-dblclick="showEditTypeModal"
        style="height:calc(100% - 35px);overflow:hidden"
    >
		<div slot="footer" style="overflow:hidden">
			<Page
				:total="allTableData.length"
				:page-size="showTableRows"
				show-sizer
				:transfer="false"
				@on-change="pageChange"
				@on-page-size-change="pageSizeChange"
				style="display:inline-block;float:left"
			/>
			<Button type="primary" size="default" style="float:left;margin-top:10px" @click="exportFile">下载文件</Button>
		</div>
	</Table>
	
    <Modal
        v-model="editTypeModal"
		loading
        :transfer="false"
        title="分类编辑"
        @on-ok="changeType"
    >
        <Form ref="editTypeForm" :model="formItems" :rules="formRules" :label-width="80">
            <FormItem label="类别1：" prop="firstType">
                <Select v-model="formItems.firstType" size="default" :transfer="false" clearable >
                    <Option v-for="item in typeList" :key="item._id" :value="item.code" :label="item.desc"></Option>
                </Select>
            </FormItem>
            <FormItem label="类别2：" prop="secondType">
                <Select v-model="formItems.secondType" size="default" :transfer="false" clearable >
                    <Option v-for="item in typeList" :key="item._id" :value="item.code" :label="item.desc">
						<span>{{ item.desc }}</span>
						<span style="float:right;color:#ccc">{{ item.code }}</span>
					</Option>
                </Select>
            </FormItem>
            <FormItem label="备注：" prop="remark">
                <Input type="text" v-model="formItems.remark" size="default" />
            </FormItem>
        </Form>
    </Modal>
</Card>
</template>
<script>
import TranslatePoptip from "./childComponents/translatePoptip.vue"
const colMinWidth = 90
const scrollFunction = function(evt){
    const $ = evt.data.jquery
    if($(this).find("table").height()-($(this).scrollTop()+$(this).height())<30){
        evt.data.vm.showMore()
    }
}
export default {
    components:{TranslatePoptip},
    data(){
		const $ = this.$root.jquery
		const notice = this.$root.notice
		const message = this.$root.message
		const serverAddr = this.$root.serverAddr
		const modal = this.$root.modal
        const data = {
			serverAddr,
            jquery:$,
			notice,
			message,
			modal,
            fromFileName:"",
            tableClumns:[
				// {title:"卖家账号",key:"sUName",minWidth:colMinWidth,fixed:"left"},
                {type:"index",width:60,fixed:"left"},
                {
					title:"差评内容",
					key:"originComment",
					width:180,
					render:(h,info)=>{
						return h(TranslatePoptip,{
							props:{
								ajax:this.jquery.ajax,
								query:info.row.originComment,
								serverAddr
							},
							on:{
								"update-translate":newTrans=>{
									this.updateEval(info.row._id,{translatedComment:newTrans},data=>{
										if(data.success){
											let target = this.pageData.filter(v=>v._id===info.row._id)[0]
											if(target){
												target.translatedComment = newTrans
											}else{
												target = this.allTableData.filter(v=>v._id===info.row._id)[0]
												if(target){
													target.translatedComment = newTrans
												}
											}
											this.message.success("数据更新成功！")
										}else{
											this.message.error("更新失败，请稍后再试！")
										}
									},xhr=>{
										this.message.error("网络错误，更新失败，请稍后再试！")
									})
								}
							}
						},
						info.row.originComment
						)
					}
				},
                {title:"买家账号",key:"sellerAccount",minWidth:colMinWidth},
                {title:"评价时间",key:"commentTime",minWidth:colMinWidth},
                {title:"产品",key:"produce",width:230},
                {title:"单价",key:"price",minWidth:colMinWidth},
                {title:"归类1",key:"firstType",minWidth:colMinWidth},
                {title:"归类2",key:"secondType",minWidth:colMinWidth},
                {title:"备注",key:"remark",minWidth:colMinWidth},
                {title:"译文",key:"translatedComment",width:180}
			],
			metaData:[],
			allTableData:[],
			pageData:[],
            showTableRows:20,
            tableLoading:true,
			editTypeModal:false,
			typeList:null,
			editingRow:null,
            formItems:{
                firstType:"",
                secondType:"",
				remark:"",
				fileId:""
            },
            formRules:{
                firstType:{required:false},
                secondType:{required:false},
                remark:{validator:(rule,value,cb)=>{
                    if(this.formItems.firstType==="T"){
                        if(value===""){
                            cb(new Error("请填写备注！"))
                        }else{
                            cb()
                        }
                    }else{
						cb()
					}
                },trigger:"blur"}
            }
		}
		data.filterModel = {
			colName:"",
			kw:""
		}
		data.filterRules = {}
		data.transBtnLoading = false
        return data
    },
    methods:{
        showEditTypeModal(row,rowIndex){
			if(!this.typeList){
				this.loadTypeList(...arguments)
				return 
			}
			console.log(arguments)
			this.formItems.firstType = row.firstType
			this.formItems.secondType = row.secondType
			this.formItems.remark = row.remark
			this.formItems.fileId = row.fromFileId
			this.editingRow = row._id
            this.editTypeModal = true
		},
		loadTypeList(){
			this.jquery.ajax({
				url:this.$root.serverAddr+"/api/CommentType/select",
				type:"POST",
				dataType:"JSON",
				success:data=>{
					console.log(data)
					if(data.success){
						this.typeList = data.data
						this.showEditTypeModal(...arguments)
					}else{
						this.message.error("类别选项加载失败，无法进行分类！")
					}
				},
				error:xhr=>{
					console.log(xhr)
					this.message.error("请求错误，请稍后再试！")
				}
			})
		},
        changeType(){
			console.log(arguments)
			this.$refs.editTypeForm.validate((valid)=>{
				console.log("表单验证！")
				if(valid){
					this.jquery.ajax({
						url:this.$root.serverAddr+"/api/comment/update",
						type:"POST",
						data:Object.assign({_id:this.editingRow},{update:this.formItems}),
						dataType:"JSON",
						success:data=>{
							console.log(data)
							if(data.success&&data.data.ok===1){
								Object.assign(this.allTableData.filter(v=>v._id===this.editingRow)[0],this.formItems)
								this.$refs.editTypeForm.resetFields()
								this.editTypeModal = false
								this.message.success("成功！")
							}else{
								this.message.error("失败！")
							}
						},
						error:xhr=>{
							console.log(xhr)
						}
					})
				}else{
					this.message.error("表单数据验证错误，请检查表单是否误后再试！")
				}
			})
		},
		doFilter(){
			let testExp
			if(this.filterModel.colName!==""&&this.filterModel.kw===""){
				testExp = new RegExp(/^\s*$/)
			}else{
				testExp = new RegExp(this.filterModel.kw)
			}
			
			this.allTableData = this.metaData.filter(v=>testExp.test(v[this.filterModel.colName]))
			this.pageChange(1)
		},
		pageChange(cur){
			console.log(this.showTableRows)
			this.pageData = this.allTableData.slice(this.showTableRows*(cur-1),cur*this.showTableRows)
		},
		pageSizeChange(size){
			this.showTableRows = size
			this.pageChange(1)
		},
		updateEval(rowId,updateData,success,error){
			this.jquery.ajax({
				url:this.$root.serverAddr+"/api/comment/update",
				type:"POST",
				data:{
					_id:rowId,
					update:updateData
				},
				dataType:"JSON",
				success,
				error
			})
		},
		doTranslate(query,success,error){
			this.jquery.ajax({
				url:this.serverAddr+"/api/translate",
				type:"POST",
				data:{
					q:query,
					from:"auto",
					to:"zh"
				},
				dataType:"JSON",
				success,
				error
			})
		},
		translateAll(transList){
			this.transBtnLoading = true
			let query = ""
			let count = {
				success:0,
				failed:0
			}
			let maxTrans = transList.length
			const isFinish = (success)=>{
				if(success)
					count.success++
				else
					count.failed++
				console.log(count)
				if(count.success+count.failed===maxTrans){
					this.transBtnLoading = false
					this.message.success("成功翻译"+count.success+"条，失败"+count.failed+"条。")
				}
			}
			transList.forEach((v,i)=>{
				if(i>=maxTrans) return false
				query += v.originComment
				if(i===(maxTrans-1)||(query+transList[i+1].originComment).length>3000){
					console.log(i)
					this.doTranslate(query,rdata=>{
						console.log(rdata)
						if(rdata.success){
							let data = rdata.data
							data.trans_result.forEach(v=>{
								var target = transList.filter(v2=>v2.originComment===v.src)
								if(target.length===0){
									isFinish(false)
									return false
								}
								this.updateEval(
									target[0]._id,
									{translatedComment:v.dst},
									data=>{
										if(data.success){
											target[0].translatedComment = v.dst
											isFinish(true)
										}else{
											isFinish(false)
										}
									},
									xhr=>{
										isFinish(false)
									}
								)
							})
						}else{
							isFinish(false)
						}
						
					},xhr=>{
						console.log(xhr)
						isFinish(false)
					})
					query = ""
				}else{
					query += "\n"
				}
			})
		},
		translateCurPage(){
			this.modal.confirm({
				content:"批量翻译可能需要一些时间，确定要翻译吗？",
				transfer:false,
				onOk:()=>{
					this.translateAll(this.pageData)
				}
			})
		},
		exportFile(){
			//账号	差评内容	买家账号	评价时间	产品	单价	备注	归类1	归类2	译文
			const columns = [
				{title:"账号",key:"sUName"},
				this.tableClumns.filter(v=>v.key==="originContent")[0],
				this.tableClumns.filter(v=>v.key==="bUName")[0],
				this.tableClumns.filter(v=>v.key==="pjTime")[0],
				this.tableClumns.filter(v=>v.key==="produce")[0],
				this.tableClumns.filter(v=>v.key==="price")[0],
				this.tableClumns.filter(v=>v.key==="mark")[0],
				this.tableClumns.filter(v=>v.key==="firstType")[0],
				this.tableClumns.filter(v=>v.key==="secondType")[0],
				this.tableClumns.filter(v=>v.key==="translatedText")[0]
			]
			console.log(columns)
			this.$refs.evalTable.exportCsv({
				filename:this.fromFileName,
				columns,
				data:this.allTableData,
				quoted:true
			})
		}
    },
    mounted(){
        const vm = this
        const $ = this.jquery
		console.log(this.$root.routeParam)
		const routeParams = this.$root.routeParam
		if(!routeParams||!routeParams.fileInfo){
			this.$root.goRoute("/")
		}
        this.fromFileName = this.$root.routeParam.fileInfo.originalname
        $.ajax({
            url:this.$root.serverAddr+"/api/comment/select",
            type:"POST",
            data:{
                fileId:this.$root.routeParam.fileInfo._id
            },
            dataType:"JSON",
            success:(data)=>{
                console.log(data)
                if(data.success){
					this.allTableData = data.data
					this.metaData = data.data
					this.pageData = data.data.slice(0,this.showTableRows)
                    this.tableLoading = false
                }else{
                    vm.notice.error({
                        title:"错误",
                        desc:"评价列表加载失败！"
                    })
                }

            },
            error:(xhr)=>{
                console.log(xhr)
                vm.notice.error({
                    title:"错误",
                    desc:"网络或服务器出错！"
                })
            }
        })
        //[scroll load]
        // let findEl = setInterval(()=>{
        //     if($("#evaluateList .ivu-table-overflowY").is("#evaluateList .ivu-table-overflowY")){
        //         $("#evaluateList .ivu-table-overflowY").on("scroll",{jquery:$,vm},scrollFunction)
        //         clearInterval(findEl)
        //     }
        // },10)
        //[data load] typeList
        
        
    }
}
</script>
<style lang="stylus">
#evaluateList
    .ivu-card-body
        height 100%
	.ivu-table-fixed{
		overflow hidden
		height calc(100% - 48px)
		.ivu-table-fixed-body{
			height calc(100% - 40px)!important
		}
	}
    .ivu-table-body
        height calc(100% - 88px)!important
    .ivu-table-tip
        height 100%!important
</style>


