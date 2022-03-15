<template>
	<view class="bodyMain bodyBG">
		<u-navbar title="充值使用时长" />
		<view class="userInfo m-radius flex-start">
			<view class="avatar flex-center">
				<u-image   class="m-icon" v-if="loginUserInfo.avatar" :src="loginUserInfo.avatar" width="130" height="130" shape="circle" mode="aspectFill" />
				<text class="iconfont icon flex-center" v-else>&#xe610;</text>
			</view>
			<view class="info flex-space-around">
				<view class="flex-start">
					<text class="name">{{ loginUserInfo.nickName }}</text>
					<view class="flex-start GradeBg">
						<image class="icon" src="@/static/icon/Diamonds.png" mode="aspectFill" />
						<text class="Grade">Premium</text>
					</view>
				</view>
				<text class="useTimeInfo">{{ overdueTime }}，购买后使用时长顺延</text>
			</view>
		</view>
		<view class="swiperBox">
			<swiper class="swiper" indicator-dots :current="current" @change="swiperChange" indicator-color="rgba(255, 54, 162, .2)"
				previous-margin="60rpx" next-margin="60rpx" :circular="true" indicator-active-color="#f1598e">
				<swiper-item v-for="(item, index) in paymentPackageLit" :key="index">
					<view class="swiperItem flex-center " :class="{ active: current === index }">
						<view class="imageBox flex-center">
							<text class="iconfont  crown" v-if="item.isCrown">&#xe622;</text>
							<u-image width="255rpx" height="220rpx" src="/static/icon/91UberWhite.png" mode="aspectFill" />
							<text class="title">{{ item.name }}</text>
						</view>
						<view class="cardInfo">
							<text class="cardTitle flex-start">AUD ${{item.price}} · {{item.days}}天会员</text>
							<view class="item flex-start">
								<text class="iconfont icon" >&#xe621;</text>
								<text class="iconInfo">浏览当地超过1000+资料信息</text>
							</view>
							<view class="item flex-start">
								<text class="iconfont icon" >&#xe621;</text>
								<text class="iconInfo">每周定时上架新人信息</text>
							</view>
							<view class="item flex-start">
								<text class="iconfont icon" >&#xe621;</text>
								<text class="iconInfo">解锁app全部功能</text>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
		<view  :class="['PreciseSearch absoluteBtn padding ',{isAndroid: isAndroid}]"><u-button hover-class="none" plain class="searchBtn  pink  m-btn" @click="confirmPay">点击支付</u-button></view>
	</view>
</template>

<script>
	import moment from 'moment';
	import { mapState, mapMutations } from "vuex";
	export default {
		data() {
			return {
				current: 2, // 当前选中的swiper
				paymentPackageLit: [], //时长数据套餐列表
				payLoading: false,
			};
		},
		computed: {
			overdueTime() {
				if (this.loginUserInfo.availableTime) {
					return moment().add(this.loginUserInfo.availableTime, 'day').format("YYYY年M月D号") + '到期';
				}
				return '已到期';
			},
			...mapState({
				loginUserInfo: state => state.loginUserInfo,
			})
		},
		onLoad() {
			this.getPaymentPackageLit()
		},
		methods: {
			swiperChange(e) {
				// swiper切换
				this.current = e.target.current;
			},
			confirmPay() {
				const data = this.paymentPackageLit[this.current]
				uni.navigateTo({
					url: '../pay/pay?durationSetMealId=' + data.id + '&payMoney=' + data.price + '&days=' + data
						.days
				})
			},
			getPaymentPackageLit() { //查询充值时长套餐
				this.$http.get(this.$api.paymentPackageList).then(res => {
					this.paymentPackageLit = res.list;
					console.log('充值使用时常数据：',this.paymentPackageLit);
				})
			},
		}
	};
</script>

<style lang="scss" scoped src="../css/useTime.scss"></style>
