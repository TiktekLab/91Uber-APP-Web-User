<template>
	<view class="bodyMain ">
		<u-navbar :title="payTitle" />
		<view class="moneyBg">
			<view class="flex-center money m-radius">
				<text>{{ formatPrice(cardForm.amt) }}</text>
				<text class="btn flex-center">当前余额：{{ bondBalance ? formatPrice(bondBalance) : "$0.00" }}</text>
			</view>
		</view>

		<view class="cardBox" v-if="!isPaySuccess">
			<view class="shadow">
				<image class="cardIcon" v-if="cardTypeInfo.cardIcon" :src="cardTypeInfo.cardIcon"></image>
				<text class="txt" v-if="cardTypeInfo.cardType">{{ cardTypeInfo.cardType }}</text>
			</view>
			<view class="shadow">
				<input v-model="cardForm.cardNumber" class="input" type="number" placeholder="请输入卡号" />
			</view>
			<view class="flex-space-between three">
				<view class="shadow item"><input class="input" v-model="cardForm.expMonth" type="number" placeholder="有效期MM" /></view>
				<view class="shadow item"><input class="input" v-model="cardForm.expYear" type="number" placeholder="有效期YY" /></view>
				<view class="shadow item"><input class="input" v-model="cardForm.cvc" type="number" placeholder="安全码" /></view>
			</view>
		</view>
		<!-- 充值成功 -->
		<view class="Recharge flex-center" v-else><u-image class="UberIcon" width="255rpx" height="221rpx" src="@/static/icon/91Uber.png" mode="aspectFill" /></view>
		<view class="Tips padding">
			<text>
				温馨提示：
				<br />
				银行会收取2%的手续费。
				<br />
				约会确认完成后，定金会自动退还到账户余额。
				<br />
				在约会结束之前，如要进行另外的预约，则需要再次充值。
				<br />
				商家接单后，若用户取消预约，则会扣除全部定金。若商家取消预约，则定金自动退还到用户的账户余额。
				<br />
				如有任何疑问，请联系我们的在线客服。
			</text>
		</view>
		<view :class="['PreciseSearch padding absoluteBtn', { isAndroid: isAndroid }]">
			<u-button hover-class="none" plain class="searchBtn  pink  m-btn" :loading="payloading" :disabled="payloading" @click="confirmPay">{{ isPaySuccess ? "返回我的余额" : "确认支付" }}</u-button>
		</view>
		<!--  3D验证  -->
		<web-view
			v-if="stripeShow"
			ref="webview"
			class="web-view"
			:src="validUrl"
			@message="handleMessage"
			:style="{ width: systemInfo.windowWidth, height: systemInfo.windowHeight }"
		></web-view>
	</view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { updateSetLoginUserInfo } from "@/common/js/storeCommon.js";
export default {
	data() {
		return {
			cardForm: {
				cardNumber: "",
				expMonth: "",
				expYear: "",
				cvc: "",
				amt: undefined,
				paymentMethodId: undefined,
				paymentIntentId: undefined,
				durationSetMealId: undefined //套餐id
			},
			bond: undefined, // 保证金
			systemInfo: {},
			validUrl: undefined,
			stripeShow: false,
			payloading: false,
			payApi: undefined,
			payTitle: undefined,
			payDescribe: undefined,
			successTips: undefined, //充值成功提示
			isPaySuccess: false
		};
	},
	computed: {
		cardTypeInfo() {
			//0.VISA Card 1.Master Card
			if (this.cardForm.cardNumber) {
				if (this.cardForm.cardNumber.indexOf("4") === 0) {
					return {
						cardType: "Visa Card",
						cardIcon: "../../../static/icon/visa.png"
					};
				} else if (this.cardForm.cardNumber.indexOf("5") === 0) {
					return {
						cardType: "Master Card",
						cardIcon: "../../../static/icon/card.png"
					};
				}
			}
			return {};
		},
		...mapState({
			bondBalance: state => state.loginUserInfo.bondBalance
		})
	},
	onLoad(option) {
		this.systemInfo = uni.getSystemInfoSync();
		this.bond = option.bond;
		this.cardForm.amt = option.payMoney;
		this.cardForm.durationSetMealId = option.durationSetMealId;
		if (this.cardForm.durationSetMealId) {
			this.payApi = this.$api.rechargeDays;
			this.payTitle = "充值使用时长";
			this.payDescribe = "使用时长：" + option.days + "天";
			this.successTips = "使用时长充值成功";
		} else {
			this.payApi = this.$api.paymentDeposit;
			this.payTitle = "充值定金";
			this.payDescribe = "定金支付";
			this.successTips = "定金充值成功";
		}
	},
	methods: {
		confirmPay() {
			if (this.isPaySuccess) {
				// 充值成功就返回上一页
				return uni.navigateBack();
			}
			if (!this.cardForm.cardNumber) {
				return uni.showToast({
					title: "请输入卡号",
					icon: "none"
				});
			}
			if (this.cardForm.cardNumber.trim().length < 10 || this.cardForm.cardNumber.trim().length > 16) {
				return uni.showToast({
					title: "请输入16位数字卡号",
					icon: "none"
				});
			}
			if (!this.cardForm.expMonth || !this.cardForm.expYear) {
				return uni.showToast({
					title: "请输入卡号有效期",
					icon: "none"
				});
			}
			if (this.cardForm.expMonth.trim().length > 2) {
				return uni.showToast({
					title: "有效期月份2位数字",
					icon: "none"
				});
			}
			if (this.cardForm.expYear.trim().length !== 2) {
				return uni.showToast({
					title: "有效期年份2位数字",
					icon: "none"
				});
			}
			if (!this.cardForm.cvc) {
				return uni.showToast({
					title: "请输入安全码",
					icon: "none"
				});
			}
			if (this.cardForm.cvc.trim().length !== 3) {
				return uni.showToast({
					title: "安全码3位数字",
					icon: "none"
				});
			}
			if (this.cardForm.expMonth.trim().length === 1) {
				this.cardForm.expMonth = "0" + this.cardForm.expMonth;
			}
			this.payAction();
		},
		payAction() {
			this.payloading = true;
			this.$http.post(this.payApi, this.cardForm).then(res => {
					this.payloading = false;
					const { scriptJs, paymentIntentId, isVerify } = res;
					this.cardForm.paymentIntentId = paymentIntentId;
					if (isVerify) {
						uni.showLoading({
							mask: true
						});
						this.validUrl = "/hybrid/html/paySecure.html" + scriptJs.match(/\?[\d|\D]*/);
						this.stripeShow = true;
					} else {
						this.stripeShow = false;
						this.isPaySuccess = true;
						updateSetLoginUserInfo();
						uni.showToast({
							title: this.successTips,
							icon: "none",
							duration: 1500
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				}).catch(err => {
					this.cardForm.paymentIntentId = undefined;
					this.payloading = false;
				});
		},
		handleMessage(evt) {
			// 监听webView返回数据.
			console.log("evt", evt);
			const res = evt.detail.data[0];
			switch (res.code) {
				case 0:
					uni.hideLoading();
					break;
				case 1:
					this.paySecure(res.data);
					break;
			}
		},
		paySecure(data) {
			// 处理验证结果
			this.stripeShow = false;
			if (data.paymentIntent) {
				// 验证通过 二次验证
				this.payAction();
			} else {
				this.cardForm.paymentIntentId = undefined;
				// 失败 提示错误信息
				uni.showToast({
					title: data.error.message,
					icon: "none"
				});
			}
		}
	}
};
</script>

<style lang="scss" scoped src="../css/pay.scss"></style>
