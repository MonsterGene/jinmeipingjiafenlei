<template>
<Poptip
	width=200
	@on-popper-hide="translateResult=''"
	:transfer="false"
	trigger="click"
>
	<slot></slot>
	<div slot="content">
		<Button
			type="primary"
			size="default"
			@click="doTranslate"
			:loading="btnLoading"
		>
			<template v-if="btnLoading">正在翻译...</template>
			<template v-else>翻译</template>
		</Button>
		<Button
			v-if="translateResult.length>0"
			type="primary"
			ghost
			size="default"
			@click="updateTranslate"
		>更新到译文</Button>
		<div style="white-space:normal">
			<Tag v-if="translateResult.length>0" color="blue">{{ from }}>{{ to }}</Tag>
			{{ translateResult }}
		</div>
	</div>
</Poptip>
</template>
<script>
import LangList from "./langList.js"
export default {
	props:["ajax","query","serverAddr"],
	data(){
		return {
			from:"",
			to:"",
			translateResult:"",
			btnLoading:false
		}
	},
	methods:{
		doTranslate(){
			this.btnLoading = true
			this.ajax({
				url:this.serverAddr+"/api/translate",
				type:"post",
				data:{
					q:this.query,
					from:"auto",
					to:"zh"
				},
				dataType:"JSON",
				success:data=>{
					console.log(data)
					if(data.success){
						this.btnLoading = false
						this.translateResult = data.data.trans_result[0].dst
						this.from = LangList[data.data.from]
						this.to = LangList[data.data.to]
					}else{
						this.translateResult = data.errMsg
						setTimeout(()=>{
							this.btnLoading = false
						},1500)
					}
				},
				error:xhr=>{
					console.log(xhr)
					this.translateResult = "翻译请求失败，请稍后再试！"
					setTimeout(() => {
						this.btnLoading = false
					}, 1500);
					
				}
			})
		},
		updateTranslate(){
			this.$emit("update-translate",this.translateResult)
		}
	}
}
</script>

