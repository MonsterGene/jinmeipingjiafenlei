module.exports = {
    getTypeList(){
        this.jquery.ajax({
            url:this.$root.serverAddr+"/getTypeList",
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