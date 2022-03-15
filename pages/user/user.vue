<template>
	<view class="bodyMain bodyBG">
		<u-navbar title="个人中心" :is-back="false" :border-bottom="false" />
		<view class="userInfo flex-start" @click="navigateTo('./userInfo/userInfo')">
			<view class="avatar flex-center">
				<u-image class="m-icon" :src="loginUserInfo.avatar" v-if="loginUserInfo.avatar" width="130" height="130" shape="circle" mode="aspectFill" />
				<text class="iconfont icon flex-center" v-else>&#xe610;</text>
			</view>
			<view class="info flex-space-between">
				<view class="left flex">
					<view>
						<text class="name">{{ loginUserInfo.nickName }}</text>
						<text>UID：{{ loginUserInfo.name }}</text>
					</view>
					<view class="flex-start">
						<view class="rate flex-start">
							<text class="iconfont icon">&#xe642;</text>
							<text>{{ loginUserInfo.score | scoreFormat() }}</text>
						</view>
						<text class="count">当前预约：{{ orderInProgressCount }}</text>
					</view>
				</view>
				<view class="right flex-end"><u-icon name="arrow-right" color="#C7C7CC" /></view>
			</view>
		</view>
		<!-- 我的余额 -->
		<view class="balance m-radius flex-space-between" @click="navigateTo('./recharge/recharge')">
			<view class="flex-start">
				<text>我的余额：</text>
				<text class="strong">{{ loginUserInfo.bondBalance ? formatPrice(loginUserInfo.bondBalance) : '$0.00' }}</text>
			</view>
			<view class="flex-start">
				<text class="Recharge">前往充值</text>
				<u-icon name="arrow-right" color="#FFFFFF" />
			</view>
		</view>

		<view class="itemBox">
			<view class="item flex-space-between" @click="navigateTo('./userOrderList/userOrderList')">
				<view class="left flex-start">
					<text class="iconfont icon">&#xe61e;</text>
					<text>我的订单</text>
				</view>
				<view class="right flex-end"><u-icon name="arrow-right" color="#C7C7CC" /></view>
			</view>
			<view class="item flex-space-between" @click="switchTab">
				<view class="left flex-start">
					<text class="iconfont icon">&#xe620;</text>
					<text>我的关注</text>
				</view>
				<view class="right flex-end"><u-icon name="arrow-right" color="#C7C7CC" /></view>
			</view>
			<!-- <view class="item flex-space-between" @click="navigateTo('./useTime/useTime')"> -->
			<view class="item flex-space-between" @click="ShowModal">
				<view class="left flex-start">
					<text class="iconfont icon">&#xe621;</text>
					<text>会员等级</text>
					<!-- <text class="strong">Premium</text> -->
				</view>
				<view class="right flex-end">
					<text class="rightText">{{ overdueTime }}</text>
					<u-icon name="arrow-right" color="#C7C7CC" />
				</view>
			</view>
			<view class="item flex-space-between" @click="navigateTo('./contactUs/contactUs')">
				<view class="left flex-start">
					<text class="iconfont icon">&#xe61f;</text>
					<text>联系我们</text>
				</view>
				<view class="right flex-end"><u-icon name="arrow-right" color="#C7C7CC" /></view>
			</view>
		</view>
		<u-modal v-model="isShowModal" confirm-text="取消" @cancel="ShowModal" title="尚未开放" content="功能尚未开发，敬请期待" />
		<!-- 自定义tabBar -->
		<tabBar :active="3" />
	</view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import moment from "moment";
import tabBar from "@/component/tabBar/tabBar.vue";
export default {
	components: {
		tabBar
	},
	data() {
		return {
			orderInProgressCount: undefined,  // 当前预约
			isShowModal: false, // 是否显示弹框
		};
	},
	onLoad() {
		uni.hideTabBar();
	},
	onShow() {
		this.getData();		
	},
	computed: {
		...mapState({
			loginUserInfo: state => state.loginUserInfo
		}),
		overdueTime() {
			if (this.loginUserInfo.availableTime) {
				return moment().add(this.loginUserInfo.availableTime, 'day').format("YYYY年M月D号") + '到期';
			}
			return '已到期';
		},
	},
	methods: {
		navigateTo(url) {
			uni.navigateTo({
				url: url
			});
		},
		ShowModal() {
			this.isShowModal = !this.isShowModal;
		},
		switchTab() {  // 我的关注
			uni.setStorage({
				key: "currentTabs",
				data: "3",
				success: function() {
					uni.switchTab({
						url: "../list/list"
					});
				}
			});
		},
		getData() {
			//查询当前客户信息
			this.$http.get(this.$api.orderInProgressCount).then(res => {
				this.orderInProgressCount = res.count;
			});
		},
	}
};
</script>

<style lang="scss" scoped src="./css/user.scss"></style>
