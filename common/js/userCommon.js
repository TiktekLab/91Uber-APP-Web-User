import $store from '@/store';
import { updateNotificationUnreadCount, updateSetLoginUserInfo } from "./storeCommon.js";
import { updateLocalFollow, updateLocalNotice } from "./localDatabase.js";

//消息页面路由
const messagePageRoute = "pages/news/news";

//获取登录Token
export function getToken() {
	const token = $store.state.userInfo.access_token;
	if (token) return token;
	const userInfo = uni.getStorageSync("userInfo");
	return userInfo?.access_token;
}

//登录Token过期，无权限提示登录
let popFlag = true;
export function loginPrompt() {
	if (popFlag) {
		popFlag = false;
		uni.showModal({
			title: '温馨提示',
			content: '此时此刻需要您登录哦~',
			confirmText: "去登录",
			showCancel: false,
			success: function(res) {
				if (res.confirm) {
					uni.reLaunch({
						url: "/pages/login/login"
					})
					popFlag = true;
				}
			}
		})
	}
}

//根据消息类型更新本地数据
const updateInfoByMsgType = (mesageType) => {
	if ([4, 6, 11, 1003].includes(mesageType)) { // 超时自动取消 || 商家取消 || 商家拒绝接单
		updateSetLoginUserInfo();
	}
	if ([6, 7, 1003].includes(mesageType)) { //(商家取消 || 商家接单)需更新排班时间
		uni.$emit("updateStaffTime");
	}
	if ([4, 5, 6, 7, 8, 9, 10, 11, 13, 1003].includes(mesageType)){
		uni.$emit("autoUpdateByPushMsg");		
	}
}

//更新消息页面数据
export const updateNewsData = (noticeType, mesageType) => {	
	if (noticeType === 100) {
		if (mesageType === 1001) {
			//更新本地公告数据				
			uni.$emit("updateMessage", {
				reset: false,
				noticeType: 4
			});
		} else if (mesageType === 1002) {
			//更新本地关注提醒数据
			uni.$emit("updateMessage", {
				reset: false,
				noticeType: 3
			});
		} else if (mesageType === 1003) {
			//更新订单提醒未读数量
			updateNotificationUnreadCount().then(res => {
				uni.$emit("updateMessage", {
					reset: false,
					noticeType: 2
				});
			});
			updateInfoByMsgType(mesageType);
		}			
	} else {
		// console.log('消息类型：', noticeType);  // 2订单提醒、3:我的关注、4:系统公告
		if (noticeType === 4) {
			//更新本地公告数据
			updateLocalNotice().then(res => {
				uni.$emit("updateMessage", {
					reset: false,
					noticeType
				});
			});
		} else if (noticeType === 3) {
			//更新本地关注提醒数据
			updateLocalFollow().then(res => {
				uni.$emit("updateMessage", {
					reset: false,
					noticeType
				});
			});
		} else if (noticeType === 2) {
			//更新订单提醒未读数量
			updateNotificationUnreadCount().then(res => {
				uni.$emit("updateMessage", {
					reset: false,
					noticeType
				});
			});
			updateInfoByMsgType(mesageType);
		}
	}
}

//消息弹框
//noticeType，1：remind  2:Notification 3:员工消息（关注的员工） 4：公告，100：登录查询离线消息数量
//mesageType，服务端发送消息具体类型，其它：1001：本地公告，1002：本地关注提醒，1003：订单提醒
export const messagePrompt = (num, noticeType, mesageType) => {
	if (num > 0) {
		updateNewsData(noticeType, mesageType);	
		const currentMessagePage = getMessagePage();
		uni.showModal({
			title: `您有${num}条新消息`,
			content: '请进入消息页面查看',
			confirmText: currentMessagePage ? "查看消息" : "前往消息",
			success: function(res) {
				if (res.confirm) {
					uni.switchTab({
						url: "/" + messagePageRoute
					});
				}
			}
		})
	}
}

//消息中心页面，当前是否在消息中心页面
export const getMessagePage = () => {
	const routes = getCurrentPages();
	if(routes && routes.length){
		const page = routes[routes.length - 1].route;
		return page === messagePageRoute;		
	}
	return false;
}
