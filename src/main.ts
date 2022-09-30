import { createApp } from "vue";
import App from "./App.vue";
import { install } from "@icon-park/vue-next/es/all";
import "@icon-park/vue-next/styles/index.css";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
createApp(App).use(ElementPlus).use(install).mount("#app");
