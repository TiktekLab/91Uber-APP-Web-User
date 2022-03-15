import $base from './baseconfig.js';
import { getToken, messagePrompt } from './userCommon.js';
import { removeLoginUserInfo } from './storeCommon.js';

let timeout = 30000;
let timeoutObj = null;
let isLogin = false;
let isSignIn = false;
let isSocketOpen = false;

function webSocketConnect() {
	isLogin = false;
	isSignIn = false;
	isSocketOpen = false;
	uni.connectSocket({
		url: $base.webSocketUrl,
		success(res) {
			console.log('连接成功 connectSocket=', res);
		},
		fail(err) {
			console.log('连接失败 connectSocket=', err);
		}
	});
	uni.onSocketOpen(function(res) {
		console.log('WebSocket连接已打开！');
		isSocketOpen = true;
		start(); //启动心跳监测
	});
	uni.onSocketError(function(res) {
		console.log('WebSocket连接打开失败，请检查！');
	});
	uni.onSocketMessage(function(res) {
		const data = JSON.parse(res.data);
		//console.log("onSocketMessage", data);
		//login:{"code":"1000","message":"success","type":"login","data":0} 
		//message:{"type":"pushNoticeMessage","data":{"description":"描述信息","noticeType":4,"receiveUserType":1,"title":"标题"}} 
		switch (data.type) {
			case 'login': 
				loginResult(data);
				break;			
			case 'pushNoticeMessage': 
				setTimeout(() => {
					const msgData = JSON.parse(data.data);
					messagePrompt(1, msgData.noticeType, msgData.type);
				}, 1000);
				break;			
			default:
				break;
		}
	});
	uni.onSocketClose(function(res) {
		isSignIn = false;
		isSocketOpen = false;
		console.log('WebSocket 已关闭！');
	});
}


function loginResult(data) {
	let code = data.code;
	if (code === "1000") {
		isSignIn = true;
		messagePrompt(data.data, 100, 1003);
	} else if (code === "ws10009") {
		isLogin = false;
		isSignIn = false;
		wsExit();
		removeLoginUserInfo();
		console.log('退出登录');
		uni.showModal({
			title:'温馨提示',
			content:'已被登出，您的账号在其他设备上登录',
			showCancel: false
		})
		setTimeout(() => {			
			uni.reLaunch({
				url: "/pages/login/login"
			});
		}, 1000);
	}
}


function start() {
	if(timeoutObj) clearInterval(timeoutObj);
	timeoutObj = setInterval(function() {
		if (isLogin && !isSignIn) {
			wsLogin();
		} else {
			uni.sendSocketMessage({
				data: 'ping',
				success: res => {
					//console.log('连接中....');
				},
				fail: err => {
					console.log('连接失败重新连接....');
					webSocketConnect();
				}
			});
		}
	}, timeout);
}

function wsLogin() {
	const token = getToken();
	let paramStr = "ping";
	if (token) {
		let param = {
			"type": "login",
			"clientId": "Dancers",
			"token": token,
		};
		paramStr = JSON.stringify(param);
	}
	//console.log("wsLogin paramStr", paramStr);
	uni.sendSocketMessage({
		data: paramStr,
		success: res => {
			console.log('登录发送成功！');
		},
		fail: err => {
			console.log('登录发送失败重新连接....');
			webSocketConnect();
		}
	});
}

function wsExit() {
	const token = getToken();
	let params = {
		"type": "memberExit",
		"clientId": "Dancers",
		"token": token,
	};
	uni.sendSocketMessage({
		data: JSON.stringify(params),
		success: res => {
			console.log('退出发送成功！');
			isLogin = false;
			isSignIn = false;
			if(timeoutObj) clearInterval(timeoutObj);
		},
		fail: err => {
			console.log('退出发送失败重新连接....');
			webSocketConnect();
		}
	});
}

function WebSocketLogin() {
	if(!isLogin) {
		isLogin = true;
		const tickObj = setInterval(()=>{
			if(isSocketOpen) {
				clearInterval(tickObj);
				wsLogin();
			}
		}, 500);				
	}
}

function WebSocketExit() {
	if(isLogin) {
		isLogin = false;
		wsExit();		
	}
}

function WebSocketClose() {
	if(isSocketOpen) uni.closeSocket();
}

module.exports = {
	webSocketConnect,
	WebSocketLogin,
	WebSocketExit,
	WebSocketClose
};