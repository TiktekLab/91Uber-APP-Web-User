import request from "@/plugins/request";
import base from './baseconfig.js';
import { loginPrompt, getToken } from './userCommon.js';

const debug = false;
//可以new多个request来支持多个域名请求
let $http = new request({
	//接口请求地址
	baseUrl: base.baseUrl,
	//设置请求头（如果使用报错跨域问题，可能是content-type请求类型和后台那边设置的不一致）
	header: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
});


//请求开始拦截器
$http.requestStart = function(options) {
	debug && console.log("请求开始", options);
	if (options.load) {
		//打开加载动画
		uni.showLoading({
			mask: true
		});
	}
	if(options.tokenRequired) {		
		//请求前加入token
		const token = getToken();
		if (token) options.header['Authorization'] = 'Bearer ' + token;
	}
	return options;
}

//请求结束
$http.requestEnd = function(options) {
	//判断当前接口是否需要加载动画
	if (options.load) {
		// 关闭加载动画
		uni.hideLoading();
	}
}

//所有接口数据处理
$http.dataFactory = async function(res) {
	debug && console.log("响应数据", {
		url: res.url,
		resolve: res.response,
		header: res.header,
		data: res.data,
		method: res.method,
	});
	if (res.response.statusCode && res.response.statusCode == 200) {
		let httpData = res.response.data;
		if (typeof(httpData) == "string") {
			httpData = JSON.parse(httpData);
		}
		let responseCode = httpData.code || '' + httpData.resp_code;
		let responseMsg = httpData.msg || httpData.resp_msg;
		//判断数据是否请求成功
		if (responseCode === '1000' || responseCode === '0') {
			// 返回正确的结果(then接受数据)
			return Promise.resolve(httpData.data || httpData.datas);
		} else if (responseCode === "1" || responseCode === '-1') {
			
			loginPrompt();
		
			// 返回错误的结果(catch接受数据)
			return Promise.reject({
				statusCode: responseCode,
				errMsg: responseMsg,
				data: res.data,
				isPrompt: false
			});
		} else { 
			// 返回错误的结果(catch接受数据)
			return Promise.reject({
				statusCode: responseCode,
				errMsg: responseMsg,
				data: res.data,				
				isPrompt: res.isPrompt
			});
		}
	} else {
		let errMsg = '数据工厂验证不通过';
		if (res.response.data) {
			errMsg = res.response.data.msg || res.response.data.resp_msg || '网络错误，请检查一下网络'
		}
		// 返回错误的结果(catch接受数据)
		return Promise.reject({
			statusCode: res.response.statusCode,
			errMsg: errMsg,
			data: res.data,				
			isPrompt: res.isPrompt
		});
	}
};
// 错误回调
$http.requestError = function(e) {
	if (e.statusCode === 401) {		
		loginPrompt();
	} else if(e.isPrompt){	
		let tips = '网络错误，请检查一下网络';
		if (e.statusCode === 'ORC500') {
			tips = '请返回重新刷新';
		}
		uni.showToast({
			title: e.errMsg || tips,
			icon: "none",
			duration: 3000
		});		
	}
}
export default $http;
