<template>
	<view class="bodyMain hideScroll">
		<u-navbar :is-back="false">
			<view class="navBar flex-center padding">
				<!-- <text>心动</text>
				<image src="@/static/icon/xin.png" mode="aspectFill" /> -->
				<text>列表</text>
			</view>
		</u-navbar>
		<u-tabs
			height="100"
			class="tabs"
			bg-color="#f9f9f9"
			duration="0.3"
			:list="tabs"
			:is-scroll="false"
			:current="currentTabs"
			:show-bar="false"
			active-color="#992F65"
			@change="changeTabs"
		/>

		<swiper class="main" :style="{ height: pageHeight }" :current="currentTabs" @change="swiperChange">
			<swiper-item v-for="(tab, index) in tabs" :key="index">
				<MescrollItem :height="pageHeight" :currentTabs="index" :followIds="followEmployeeIdList" :key="`mesitem${currentTabs}`" @updateFlowList="getFollowList()"/>
			</swiper-item>
		</swiper>
		<tabBar :active="1" />
	</view>
</template>

<script>
import tabBar from "../../component/tabBar/tabBar.vue";
import MescrollItem from "./components/MescrollItem.vue";
export default {
	components: {
		tabBar,
		MescrollItem
	},
	onLoad(option) {
		uni.hideTabBar();
		const height = uni.getSystemInfoSync().windowHeight;
		const isAndroid = uni.getSystemInfoSync().platform === 'android';
		this.pageHeight = height + "px";
		//this.getFollowList();
	},
	onShow() {	
		this.getFollowList();	
		const that = this;
		uni.getStorage({
			key: "currentTabs",
			success: function(res) {
				if (res.data) {
					that.currentTabs = Number(res.data);
					uni.removeStorage({
						key: 'currentTabs',
					});
				}
			}
		});
	},
	data() {
		return {
			followEmployeeIdList:[],
			tabs: [
				{
					name: "官方推荐"
				},
				{
					name: "最新上线"
				},
				{
					name: "最佳评分"
				},
				{
					name: "我的关注"
				}
			],
			currentTabs: 1,
			pageHeight: null // 页面高度
		};
	},
	methods: {
		swiperChange(e) {
			this.currentTabs = e.detail.current;
		},
		changeTabs(e) {
			this.currentTabs = Number(e);
		},
		getFollowList() {
			this.$http.get(this.$api.employeeFollowsMember).then(res => {
				this.followEmployeeIdList = res.list;
				//console.log('关注的员工列表：', res.list);
			});
		}
	}
};
</script>

<style lang="scss" scoped src="./css/list.scss"></style>
