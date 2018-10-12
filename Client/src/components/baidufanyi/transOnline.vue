<style lang="stylus" scoped>
.gray
	color:#999
.textarea-bg-text
	word-wrap break-word
	z-index 0
	width 100%
	height 100%
	padding 16px
	position absolute
	top 0
	left 0
.match-text
	background #fee972
@media screen and (max-width 768px) 
	.ivu-col-span-xs-24
		height:180px
		overflow auto
		.ivu-input-wrapper
			height:100%
		.ivu-card
			overflow auto


</style>

<template>
<div>
	<Select v-model="transModel.from" style="width:200px" size="large">
		<Option value="auto">自动检测</Option>
		<Option v-for="(lang,key) in langList" :value="key" :key="key">{{ lang }}</Option>
	</Select>
	<Icon
		type="md-swap"
		@click="exchangeLang"
		:class="{gray:transModel.from==='auto'||transModel.from===transModel.to}"
		size="26"
		style="margin:0 10px"
	/>
	<Select v-model="transModel.to" style="width:200px" size="large">
		<Option v-for="(lang,key) in langList" :value="key" :key="key">{{ lang }}</Option>
	</Select>
	<Button size="large" type="primary" @click="doTranslate" :loading="transLoading">翻 译</Button>
	<Row type="flex" style="margin-top:10px;">
		<Col :xs="{span:24}" :md="{span:12}">
			<div v-show="showSrcText" class="textarea-bg-text">
				<p v-for="result in transResult" :key="result.src" :class="{'match-text':matchText===result.src}" style="font-size:14px">{{ result.src }}</p>
			</div>
			<Input
				v-show="!showSrcText"
				type="textarea"
				:autosize="{minRows:5}"
				v-model="transModel.q"
				@on-change="doTranslate(true)"
				placeholder="请输入您要翻译的内容"
				:clearable="true"
			/>
		</Col>
		<Col :xs="{span:24}" :md="{span:12}">
			<Card style="height:100%">
				<template v-if="typeof transResult!=='string'">
					<p @mouseover="transResMouseover($event,result)" @mouseout="transResMouseout" :class="{'match-text':matchText===result.src}" v-for="result in transResult" :key="result.src">{{ result.dst }}</p>
				</template>
				<span v-else>{{ transResult }}</span>
			</Card>
		</Col>
	</Row>
</div>
</template>
<script>
import langList from "../childComponents/langList.js"
import doTranslate from "../childComponents/doTranslate.js"

export default {
	data(){
		return {
			jquery:this.$root.jquery,
			serverAddr:this.$root.serverAddr,
			langList,
			transModel:{
				from:"auto",
				to:"zh",
				q:""
			},
			transResult:"",
			transLoading:false,
			waitId:false,
			showSrcText:false,
			matchText:""
		}
	},
	methods:{
		exchangeLang(){
			if(this.transModel.from==="auto" || this.transModel.from===this.transModel.to) return 
			let tmp = this.transModel.from
			this.transModel.from = this.transModel.to
			this.transModel.to = tmp
		},
		doTranslate(isWait){
			if(isWait){
				if(this.waitId){
					clearTimeout(this.waitId)
					this.waitId = false
				}
				this.waitId = setTimeout(() => {
					this.doTranslate()
					this.waitId = false
				}, 1000);
				return
			}
			this.transLoading = true
			doTranslate(
				this.jquery.ajax,
				this.serverAddr,
				this.transModel,
				data=>{
					this.transLoading = false
					if(data.success){
						this.transResult = data.data.trans_result
						if(this.transModel.from==="auto"){
							this.transModel.from = data.data.from
						}
					}else{
						this.transResult = "翻译失败，请再试一次！"
						console.log(data)
					}
				},
				xhr=>{
					console.log(xhr)
					this.transResult = "服务器出错，请稍后再试！"
					setTimeout(() => {
						this.transLoading = false
					}, 1500);
				}
			)
		},
		transResMouseover(evt,result){
			this.matchText = result.src
			this.showSrcText = true
		},
		transResMouseout(evt,result){
			this.matchText = ""
			this.showSrcText = false
		}
	}
}
</script>

