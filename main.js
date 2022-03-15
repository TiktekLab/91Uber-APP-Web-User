import Vue from 'vue'
import App from './App'
import uView from "uview-ui";
import { noMultipleClicks, objDeepCopy } from '@/common/js/common.js';
import filters from "@/plugins/filters.js";

Vue.mixin({
	data() {
		return {
			isAndroid: false,
		}
	},
	mounted() {
		const res = uni.getSystemInfoSync();
		if (res.platform === 'android') {
			return this.isAndroid = true;
		}
		return this.isAndroid = false;
	},
	computed: {
		avatarUrl() {
			return userId => {
				return require(`@/static/image/avatar${(userId || 6) % 6}.png`);
			};
		},
		formatPrice() {
			return (price) => {
				if (!price) return '$0.00';
				const data = Number(price).toFixed(2)
				return `$${data}`
			}
		},
		formatPhone() {
			return (phone) => {
				if (!phone) return '';
				return '+61 ' + phone.substr(1);
			}
		},
	},
})
//数据管理中心
import store from '@/store'
Vue.prototype.$store = store;
//通用配置
import $base from '@/common/js/baseconfig.js';
Vue.prototype.$base = $base;
//挂载全局API
import $api from '@/common/js/api.js';
Vue.prototype.$api = $api;
//挂载全局http请求
import $http from '@/common/js/httprequest.js';
Vue.prototype.$http = $http;
//防止多次点击
Vue.prototype.$noMultipleClicks = noMultipleClicks;
//对象数组深拷贝
Vue.prototype.$objDeepCopy = objDeepCopy;
//添加全局filter
Object.keys(filters).map(v => {
	Vue.filter(v, filters[v]);
})
Vue.config.productionTip = false
App.mpType = 'app'
Vue.use(uView);
const app = new Vue({
	store,
	...App
})
app.$mount()
