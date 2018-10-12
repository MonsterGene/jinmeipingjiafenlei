import Vue from "vue"
import $ from "jquery"
import iview from "iview"

import App from "./app.vue"
import routes from "./routes.js"
import "iview/dist/styles/iview.css"
import "./static/global.styl"

Vue.use(iview, {
    transfer: false,
    size: 'default'
})
let serverAddr = ""
if (location.hostname === "127.0.0.1") {
    serverAddr = "http://127.0.0.1:3000"
} else {
    serverAddr = ""
}
const root = $("<div>")
$("body").html(root)
window.vm = new Vue({
    el: root[0],
    data: {
        jquery: $,
        notice: iview.Notice,
        message: iview.Message,
        modal: iview.Modal,
        serverAddr: serverAddr,
        currentRoute: window.location.pathname,
        routes: routes,
        routeParam: null
    },
    render: (h) => h(App),
    methods: {
        goRoute(route, routeParam) {
            console.log(arguments)
            this.currentRoute = route
            if (typeof routeParam !== "undefined") {
                this.routeParam = routeParam
            } else {
                this.routeParam = undefined
            }
            window.history.pushState(null, this.routes[route], route)
        }
    }
})
window.addEventListener('popstate', () => {
    vm.currentRoute = window.location.pathname
})