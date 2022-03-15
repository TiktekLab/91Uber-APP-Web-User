import $http from '../../common/js/httprequest.js';
import $api from '../../common/js/api.js';
import { getFollowUnReadCount, getNoticeUnReadCount } from "@/common/js/localDatabase.js";

export const state = {
	notificationUnreadCount: 0, //通知未读数量（订单提醒）
	followUnreadCount: 0, //关注提醒未读数量（关注提醒）
	noticeUnreadCount: 0, //系统公告未读数量
};
export const getters = {
	//总计未读数量
	totalUnreadCount: state => {
		return state.notificationUnreadCount + state.followUnreadCount + state.noticeUnreadCount;
	}
};
export const mutations = {
	setNotificationUnreadCount(state, value) {
		state.notificationUnreadCount = value;
		// #ifdef APP-PLUS
		const badgeNum = state.notificationUnreadCount + state.followUnreadCount + state.noticeUnreadCount;
		plus.runtime.setBadgeNumber(badgeNum);
		// #endif
	},
	setFollowUnreadCount(state, value) {
		state.followUnreadCount = value;
		// #ifdef APP-PLUS
		const badgeNum = state.notificationUnreadCount + state.followUnreadCount + state.noticeUnreadCount;
		plus.runtime.setBadgeNumber(badgeNum);
		// #endif
	},
	setNoticeUnreadCount(state, value) {
		state.noticeUnreadCount = value;
		// #ifdef APP-PLUS
		const badgeNum = state.notificationUnreadCount + state.followUnreadCount + state.noticeUnreadCount;
		plus.runtime.setBadgeNumber(badgeNum);
		// #endif
	}
};
export const actions = {
	asyncSetNotificationUnreadCount({
		commit
	}) {
		return $http.get($api.getNotificationUnreadCount).then(res => {
			commit('setNotificationUnreadCount', res.count);
		})
	},
	asyncSetFollowUnreadCount({
		commit
	}) {
		return getFollowUnReadCount().then(res => {
			commit('setFollowUnreadCount', res);
		})
	},
	asyncSetNoticeUnreadCount({
		commit
	}) {
		return getNoticeUnReadCount().then(res => {
			commit('setNoticeUnreadCount', res);
		})
	},
};
