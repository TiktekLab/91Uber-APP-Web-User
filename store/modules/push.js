export const state = {
	//是否点击消息
	messageClick: false
};
export const mutations = {
	//更新是否点击消息
	updateMessageClick(state, flag) {
		state.messageClick = flag || false;
	}
};
export const actions = {};
