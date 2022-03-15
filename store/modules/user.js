import $http from '../../common/js/httprequest.js';
import $api from '../../common/js/api.js';
export const state = {
	//用户数据
	userInfo: {},
	loginUserInfo: {}, // 当前登录的信息
	staffCategory: [], // 员工分类
};
export const getters = {
	//当前登录用户ID
	loginUserId: state => {
		return state.loginUserInfo.id;
	}
};
export const mutations = {
	//储存用户信息
	setUserInfo(state, data) {
		if (data) {
			state.userInfo = Object.assign({}, state.userInfo, data);
			uni.setStorageSync('userInfo', state.userInfo);
		}
	},
	// 退出APP
	emptyUserInfo(state) {
		state.userInfo = {};
		uni.removeStorageSync("userInfo");
	},
	setLoginUserInfo(state, value) {
		state.loginUserInfo = value
	},
	setStaffCategory(state, value) {
		state.staffCategory = value
	}
};
export const actions = {
	asyncSetLoginUserInfo({
		commit
	}) { //用户信息
		return $http.get($api.userInfo).then(res => {
			commit('setLoginUserInfo', res.member);
		});
	},
	asyncSetStaffCategory({
		commit
	}) { //分类信息
		return $http.get($api.servicesList).then(res => {
			commit('setStaffCategory', res.list)
		});
	}
};
