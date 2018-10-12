<template>
<div id="displayExcelWorkbook" style="height:100%">
<Tabs class="app-tabs-xlsx" v-if="workbook&&workbook.sheetNames.length>0" v-model="curSheetName" style="height:100%">
    <TabPane v-for="name in workbook.sheetNames" :key="name" :label="name" :name="name">
        <Table
            v-once
            border
            size="default"
            :columns="workbook.sheets[name].columns"
            :data="workbook.sheets[name].data"
            height="1000"
            style="height:100%;"
        ></Table>
    </TabPane>
</Tabs>
</div>

</template>
<script>
export default {
    props:["workbook"],
    data(){
        return {
            curSheetName:this.workbook&&this.workbook.sheetNames[0]||""
        }
    },
    mounted(){
        if(!this.workbook){
            this.workbook = this.$root.routeParam
        }
    }
}
</script>
<style lang="stylus">
#displayExcelWorkbook .ivu-tabs-content
    height calc(100% - 55px)
#displayExcelWorkbook .ivu-table-body
    height calc(100% - 40px)!important

</style>


