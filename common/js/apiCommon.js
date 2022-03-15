import $api from './api.js';
import $http from './httprequest.js';


//查询关注提醒列表
export const getFollowsRemindsList = function(data) {
	return $http.get($api.followsRemindsList, data);
}

//查询公告列表
export const getNoticeList = function(data) {
	return $http.get($api.noticeMessageList, data);
}

//关注员工
export const followStaff = function(storeId, employeeId) {
	return $http.post($api.followStaff(storeId, employeeId));
}

//取消关注员工
export const unFollowStaff = function(employeeId) {
	return $http.delete($api.unFollowStaff(employeeId));
}

//搜索员工
export const queryEmployeeList = (data, load) => {
	return $http.post($api.queryEmployee, data, { load });
}

//排序
export const queryByOrderConformity = (data, load) => {
	return $http.post($api.queryByOrderConformity, data, { load });
}

//添加CID
export const addCidHash = function() {
	const cid = uni.getStorageSync('cid');
	if(cid) {		
		return $http.post($api.addCidHash, {
			cid:cid,
			userName:'91Member'
		});
	}	
}