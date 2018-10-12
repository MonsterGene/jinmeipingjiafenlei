<style lang="stylus" scoped>
.i-icon-translate:before
	content "译"
	font-size 16px
</style>

<template>
<div class="layout" style="height:100%">
    <Layout style="height:100%">
        <Sider breakpoint="md" :hide-trigger="true" collapsible :collapsed-width="78" v-model="isCollapsed">
            <Menu @on-select="goRoute" active-name="Home" theme="dark" :open-names="['1']" :class="menuitemClasses" accordion width="auto">
                <!-- <MenuItem name="Home">
                    <Icon type="ios-settings"></Icon>
                    <span>Home</span>
                </MenuItem> -->
                <MenuItem name="typeList">
                    <Icon type="ios-navigate"></Icon>
                    <span>类别管理</span>
                </MenuItem>
                <MenuItem name="fileList">
                    <Icon type="ios-search"></Icon>
                    <span>文件列表</span>
                </MenuItem>
                <MenuItem name="transOnline">
                    <Icon class="i-icon-translate"></Icon>
                    <span>在线翻译</span>
                </MenuItem>
            </Menu>
        </Sider>
        <Layout>
            <Header class="layout-header-bar">
                <Icon @click.native="isCollapsed=!isCollapsed" :style="{margin: '0 20px',marginLeft:'-30px'}" type="md-menu" size="24"></Icon>
				<a href="javascript:;" @click="goRoute('')" style="font-size:16px">首页</a>
            </Header>
            <Content :style="{margin: '20px', background: '#fff',height:'100%',overflow:'auto'}">
                <component :is="currentComponent"></component>
            </Content>
        </Layout>
    </Layout>
</div>
</template>
<script>

export default {
    components:{
        typeList:(resolve)=>require(["./components/typeList.vue"],resolve),
        evaluateList:(resolve)=>require(["./components/evaluateList.vue"],resolve),
        fileList:(resolve)=>require(["./components/fileList.vue"],resolve),
		Home:(resolve)=>require(["./components/home.vue"],resolve),
		transOnline:resolve=>require(["./components/baidufanyi/transOnline.vue"],resolve)
        // displayExcelWorkbook:(resolve)=>require(["./components/displayExcelWorkbook.vue"],resolve)
    },
    data(){
        const data = {
            isCollapsed:false,
            jquery:this.$root.jquery
        }
        return data
    },
    computed:{
        currentComponent(){
            const cur = this.$root.currentRoute
            console.log(cur)
            console.log(this.$root.routes[cur])
            return this.$root.routes[cur]
        },
        menuitemClasses(){
            return [
                'menu-item',
                this.isCollapsed ? 'collapsed-menu' : ''
            ]
        }
    },
    methods:{
        goRoute(name){
            const route = "/"+name
            this.$root.goRoute(route)
        }
    }
}
</script>
<style lang="stylus" scoped>

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
