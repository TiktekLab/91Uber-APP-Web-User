export const state = {};
//缓存浏览器的数据名称
const cacheNameList = ["userInfo"];
export const mutations = {
	//取出缓存数据（打开APP就取出）
	setCacheData(state) {
		for (let name of cacheNameList) {
			let data = uni.getStorageSync(name);
			if (data) {
				state[name] = data;
			}
		}
	},
};
export const actions = {};
