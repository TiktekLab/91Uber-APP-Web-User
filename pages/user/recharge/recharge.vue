<template>
	<view class="bodyMain">
		<u-navbar title="我的余额" />
		<view class="main">
			<view class="balance flex-space-between m-radius">
				<text>定金余额：</text>
				<text class="money">{{ bondBalance ? formatPrice(bondBalance) : "$0.00" }}</text>
				<view class="foot flex-space-between">
				<!-- 	<text class="info">每下一单需要多加{{ bond }}作为定金</text>
					<text class="btn flex-center m-radius" @click="navigateTo">退还余额</text> -->
				</view>
			</view>
		</view>
		<!-- <view class="itemBox flex-space-between">
			<view class="item m-radius flex-center " v-for="(item, index) in list" :key="item.amount" @click="selectItem(item)" :class="{ active: activeMoney === item.amount }">
				<text>${{ item.amount }}</text>
			</view>
			<view style="width: 200rpx;"></view>
		</view> -->
		<view class="swiperBox padding">
			<swiper
				class="swiper"
				indicator-dots
				:current="current"
				@change="swiperChange"
				indicator-color="rgba(255, 54, 162, .2)"
				:circular="true"
				indicator-active-color="#f1598e"
			>
				<swiper-item v-for="(item, index) in list" :key="item.id">
					<view class="swiperItem padding m-radius flex-center">
						<!-- 最热的 -->
						<view v-if="item.isMostPopular" class="hot"><u-image width="214rpx" height="200rpx" src="@/static/icon/hotItem.png" mode="aspectFill" /></view>
						<viwe class="cardInfo">
							<u-image class="flex-center logo" width="255rpx" height="220rpx" src="@/static/icon/91UberWhite.png" mode="aspectFill" />
							<text class="title text flex-center">充值定金</text>
							<text class="content text flex-center">${{ item.amount }}</text>
						</viwe>
					</view>
				</swiper-item>
			</swiper>
		</view>
		<view :class="['PreciseSearch padding absoluteBtn', { isAndroid: isAndroid }]">
			<u-button hover-class="none" plain class="searchBtn  pink  m-btn" @click="isPay">确认充值</u-button>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
	data() {
		return {
			list: [],
			bond: undefined,
			activeMoney: 0,
			current: 2 // 当前选中的swiper
		};
	},
	onLoad() {
		//this.getMemberInfo();
		this.getList();
	},
	computed: {
		...mapState({
			bondBalance: state => state.loginUserInfo.bondBalance
		})
	},
	methods: {
		getList() {
			this.$http.get(this.$api.getAmounts, { type: 0}).then(res => {
				this.list = res.list;
				//console.log("充值金额：", this.list);
			});
		},
		swiperChange(e) {
			// swiper切换
			this.current = e.target.current;
		},
		navigateTo() {
			uni.navigateTo({
				url: "../refund/refund"
			});
		},
		isPay() {
			if(this.list && this.list.length > this.current){				
				uni.navigateTo({
					url: "../pay/pay?payMoney=" +  this.list[this.current].amount + "&bond=" + this.bond
				});
			} else {
				uni.showToast({
					title: "请选择充值金额",
					icon: "none"
				});				
			}
		},
		getMemberInfo() {
			//查询当前客户信息
			this.$http.get(this.$api.getBond).then(res => {
				if (res.isRatio) {
					this.bond = `订单金额的${res.bond}%`;
				} else {
					this.bond = this.formatPrice(res.bond);
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped src="../css/recharge.scss"></style>
