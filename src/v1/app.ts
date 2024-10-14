import "bootswatch/darkly/bootstrap.min.css";
import "./../../css/contextmenu.css";
import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-dark-theme.css";
import "./../../css/app.css";
import "./../../css/scrollbars.css";
import "jstree/dist/themes/default/style.min.css";
import "jstree/dist/themes/default-dark/style.min.css";
import "font-awesome/css/font-awesome.min.css";
import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";


import "./ImportJQuery";
import "bootstrap";
import "jstree";
import {createApp} from "vue";
import App from "../App.vue";
import {createPinia} from "pinia";
import ContextMenu from "@imengyu/vue3-context-menu";

const vueApp = createApp(App);
vueApp.use(createPinia());
vueApp.use(ContextMenu);
vueApp.mount("body");

