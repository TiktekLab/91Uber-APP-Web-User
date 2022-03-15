import $base from './baseconfig.js';
import $api from './api.js';
import $http from './httprequest.js';
import { updateSetLoginUserInfo, updateSetStaffCategory, updateNotificationUnreadCount, setCacheData, setCurrentLocation, setLoginUserInfo } from "./storeCommon.js";
import { webSocketConnect, WebSocketLogin } from "./webSocketPush.js";
import { initLocalDB, updateLocalFollow, updateLocalNotice } from "./localDatabase.js";
import { googleMapGeocodeByLatlng } from "@/common/js/googleMap.js";
import { getToken, messagePrompt } from "./userCommon.js";
import { addCidHash } from "./apiCommon.js";


//防止多次点击处理
//method是点击后需要执行的函数 
//parameters是点击需要传的参数
export function noMultipleClicks(method, parameters) {
	let that = this;
	if (that.noClick) {
		// 第一次点击
		that.noClick = false;
		method(parameters);
		setTimeout(() => {
			that.noClick = true;
		}, 2000)
	} else {
		// 这里是重复点击的判断
	}
}

//深拷贝对象数组
export function objDeepCopy(origin, target) {
	var target = target || {},
		toStr = Object.prototype.toString,
		arrStr = "[object Array]";
	for (let prop in origin) {
		if (origin.hasOwnProperty(prop)) {
			//判断是否为原型链上的属性，不是原型链上(非继承的属性)的属性时返回true
			if (origin[prop] !== "null" && typeof origin[prop] == "object") {
				//判断是否为原始值
				target[prop] = toStr.call(origin[prop]) == arrStr ? [] : {};
				objDeepCopy(origin[prop], target[prop]); // 继续返回引用值，当为原始值的时候结束
			} else {
				target[prop] = origin[prop]; // 当函数返回原始值的时候就结束此函数
			}
		}
	}
	return target;
}

//App运行时
export function launchCall() {
	//取出缓存数据
	//setCacheData();
	//本地数据
	initLocalDB();
	//监听推送
	webSocketConnect();
}

//登录后操作方法
export function loginCall() {	
	const token = getToken();
	if(token) {
		// 获取用户信息
		updateSetLoginUserInfo().then(res => {
			//更新本地关注提醒
			updateLocalFollow().then(count => {
				messagePrompt(count, 100, 1002);
			}); 
			//更新本地公告
			updateLocalNotice().then(count => {
				messagePrompt(count, 100, 1001);			
			}); 
		});
		updateNotificationUnreadCount(); // 未读通知
		updateSetStaffCategory(); // 员工分类
		WebSocketLogin();	
		setTimeout(()=> {
			addCidHash();	
		}, 10000);	
	}
}

//单例模式抽象，分离创建对象的函数和判断对象是否已经创建
export const getSingle = (fn) => {
	let result;
	return () => {
		return result ?? (result = fn.apply(this, arguments));
	}
}


//位置信息未获取到弹框
export const noLocationPrompt = () => {
	uni.showModal({
		title: '位置信息获取失败',
		content: '可能会影响您正常使用APP，请检查位置权限是否开启',
		confirmText: '重试',
		success: (res) => {
			if (res.confirm) {
				getLocation();
			}
		}
	})
}

//获取当前定位信息
export const myLocation = () => {
	return new Promise((resolve, reject) => {
		getLocation().then(res => {
			resolve(res);
		}).catch(err => {
			noLocationPrompt();
			reject(err);
		})
	})
}


//获取定位信息
const getLocation = () => {
	uni.getLocation({
		type: "wgs84",
		geocode: true,
		success(res) {
			const locationRes = res;
			googleMapGeocodeByLatlng(locationRes.latitude, locationRes.longitude).then(res => {
				const locationData = {
					latitude: locationRes.latitude,
					longitude: locationRes.longitude,
					...res
				};
				setCurrentLocation(locationData);
				return Promise.resolve(locationData);
			}).catch(err => {
				return Promise.reject(err);
			})
		},
		fail(err) {
			return Promise.reject(err);
		}
	});
}

//登录
export const login = function() {
	return new Promise((resolve, reject)=> {
		const userData = uni.getStorageSync("saveLogin");		
		if(userData){
			const loginData =  Object.assign({}, userData);
			loginData.username = '0'+ loginData.username;
			$http.post($api.login + `?grant_type=${$base.grantType}`, loginData, {
				header: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: $base.authorization
				},
				tokenRequired: false
			}).then(res => {
				setLoginUserInfo(res);
				resolve(res);
			}).catch(err => {
				reject(err);
			});
		} else {
			uni.removeStorageSync("saveLogin");
			reject("未记住密码");			
		}
	})
}


//刷新登录Token
export const refreshToken = function() {
	const timeOut = setTimeout(()=> {
		updateSetLoginUserInfo().then(res=> {
			clearTimeout(timeOut);
			refreshToken();
		}).catch(err => {
			login().then(res=> {				
				clearTimeout(timeOut);
				refreshToken();
			}).catch(err=> {
				clearTimeout(timeOut);				
			})
		})
	}, $base.tokenRefreshTime);
}

//打开链接
export const openLink = (link) => {	
	if(link){
		const url = link.toLowerCase();
		if(url.startsWith('https://') || url.startsWith('http://')){
			let toLink;
			if(url.endsWith('.pdf')){
				toLink = `/hybrid/html/web/viewer.html?file=${encodeURIComponent(link)}`;
			} else {
				toLink = encodeURIComponent(link);
			}						
			uni.navigateTo({
				url:`/pages/link/link?openLink=${toLink}`							
			})
		}
	}
}