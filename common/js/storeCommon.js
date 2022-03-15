import $store from '@/store';

//登录用户ID
export const getLoginUserId = () => {
	return $store.getters.loginUserId;
}

//更新用户信息return Promise
export const updateSetLoginUserInfo = () => {
	return $store.dispatch("asyncSetLoginUserInfo");
}

//更新员工分类return Promise
export const updateSetStaffCategory = () => {
	return $store.dispatch("asyncSetStaffCategory");
}


//更新未读通知数量return Promise
export const updateNotificationUnreadCount = () => {
	return $store.dispatch("asyncSetNotificationUnreadCount");
}

//更新未读关注提醒数量return Promise
export const updateFollowUnreadCount = () => {
	return $store.dispatch("asyncSetFollowUnreadCount");
}

//更新公告未读数量return Promise
export const updateNoticeUnreadCount = () => {
	return $store.dispatch("asyncSetNoticeUnreadCount");
}

//取除缓存数据
export const setCacheData = () => {
	$store.commit("setCacheData");
}

//存储定位信息
export const setCurrentLocation = (value) => {
	$store.commit("setCurrentLocation", value);
}

//存储登录用户信息
export const setLoginUserInfo = (value) => {
	$store.commit("setUserInfo", value);	
}

//清除登录用户信息
export const removeLoginUserInfo = () => {
	$store.commit("emptyUserInfo");	
}