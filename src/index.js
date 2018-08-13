import Vue from "vue"
import $ from "jquery"

import App from "./app.vue"
import "./static/global.styl"
const root = $("<div>")
$("body").html(root)

window.vm = new Vue({
    el:root[0],
    data:{
        jquery:$
    },
    render:(h)=>h(App)
})
