export const state = {
	currentLocation: {}, //当前位置信息
	searchCities: [], //区域搜索列表
};
export const mutations = {
	//存储当前位置信息
	setCurrentLocation(state, value) {
		state.currentLocation = value;
	},
	//存储区域搜索列表
	setSearchCities(state, value) {
		state.searchCities = value
	}
};
