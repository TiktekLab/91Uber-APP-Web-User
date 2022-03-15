import $store from '@/store';
import { updateNewsData } from "./userCommon.js";
import { login } from './common.js'
const debug = false;
export default (that) => {
	let index = 0;
	uni.removeStorageSync('cid');

	// #ifdef APP-PLUS
	// 推送
	const push = plus.push

	//获取Cid
	function getCid() {
		const cid = uni.getStorageSync('cid')
		if (!(cid && cid !== 'null') && index < 10) {
			const cid = push.getClientInfo().clientid
			uni.setStorage({
				key: 'cid',
				data: cid
			})
			index++
			setTimeout(getCid, 1000)
			debug && console.log('save cid: ', index, cid)
		} else return false;
	}

	function pushHandle(msg) {
		if (typeof(msg.payload) == 'string') { //如果是字符串，表示是ios创建的  要转换一下
			try {
				msg.payload = JSON.parse(msg.payload)
			} catch (e) {
				debug && console.log('JSON.parse error', e)
			}
		}
		
		if(msg) {			
			//plus.runtime.setBadgeNumber(0); //清除app角标					
			//推送消息点击跳转功能
			if($store.state.userInfo.access_token){
				updateNewsData(msg.payload.noticeType, msg.payload.type);
				uni.switchTab({
					url: '/pages/news/news',
				})	
			} else {			 
				login().then(res => {				
					updateNewsData(msg.payload.noticeType, msg.payload.type);
					uni.switchTab({
						url: '/pages/news/news',
					})	
				}).catch(err => {
					uni.reLaunch({
						url:'/pages/login/login'
					})
				})
			}
		} else {
			uni.reLaunch({
				url:'/pages/login/login'
			})			
		}
	}

	getCid();

	//设置程序是否将消息显示在系统消息中心
	push.setAutoNotification(true) //true表示自动显示推送消息，false则不显示

	push.addEventListener("click", function(msg) {
		$store.commit("updateMessageClick", true);
		debug && console.log('click message: ', msg)
		push.clear(); //清空通知栏
		pushHandle(msg) //处理方法
	}, false);

	// 监听在线消息事件
	push.addEventListener("receive", function(msg) {

		debug && console.log('receive message: ', msg)
		
		if (plus.os.name == 'iOS') { //由于IOS 必须要创建本地消息 所以做这个判断
			if (msg.type == 'receive'){
				if(msg.payload.content) {					
					// {"title": "xxx","content": "xxx","payload": "xxx"} 符合这种 才会自动创建消息  
					// 文档地址https://ask.dcloud.net.cn/article/35622
					push.createMessage(msg.payload.content, JSON.stringify(msg.payload)) //创建本地消息	
				} else if(msg.payload.title) {
					push.createMessage(msg.payload.title, JSON.stringify(msg.payload)) //创建本地消息						
				}
			}
		}
		
		//Android 暂时不处理
		// if (plus.os.name == 'Android') {
		// 	if (!msg.title || !msg.content || !msg.payload) { //  不符合自动创建消息的情况
		// 		//这里根据你消息字段来创建消息 
		// 		// push.createMessage(msg.payload.content,JSON.stringify(msg.payload))  //创建本地消息
		// 	} else {
		// 		//符合自动创建消息 
		// 		pushHandle(msg)
		// 	}
		// }

	}, false);
	// #endif
}
