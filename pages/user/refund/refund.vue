<template>
	<view class="bodyMain">
		<u-navbar title="退还余额" />
		<view class="main padding">
			<u-form :model="refundForm" :error-type="['toast']" ref="refundForm" class="form" label-width="250" :label-style="{ fontSize: '26rpx', fontFamily: 'PingFangSCMedium',whiteSpace:'nowrap' }">
				<u-form-item label="返还金额*" prop="amount">
					<input v-model="refundForm.amount" type="number" class="input"  placeholder="请输入返还金额" />
				</u-form-item>
				<u-form-item label="Account name*" prop="accountName">
					<input v-model="refundForm.accountName" class="input"  placeholder="请输入账户名"  />
				</u-form-item>
				<u-form-item label="BSB*" prop="bsb">
					<input v-model="refundForm.bsb" class="input"  placeholder="请输入BSB" type="number"/>
				</u-form-item>
				<u-form-item label="Account number*" prop="accountNumber">
					<input v-model="refundForm.accountNumber" class="input"  placeholder="请输入卡号" type="number" />
				</u-form-item>
			</u-form>
			<text class="info flex-start">
				<u-icon name="error-circle" color="#ff36a2" size="26" />
				定金将在3-7个工作日内退还
			</text>
		</view>
		<view class="PreciseSearch absoluteBtn"><u-button hover-class="none" plain class="searchBtn  pink  m-btn" @click="confirm">确认返还余额</u-button></view>
	</view>
</template>

<script>
const rules = require("@/common/js/rules.js"); // 表单校验
export default {
	data() {
		return {
			rules, // 表单验证
			refundForm: {
				amount: undefined,
				accountName: undefined,
				bsb: undefined,
				accountNumber: undefined
			}
		};
	},
	onReady() {
		this.$refs.refundForm.setRules(this.rules);
	},
	methods: {
		confirm() {
			this.$refs.refundForm.validate(res => {
				if (res) {
					const data = {
						amount: this.refundForm.amount,
						accountName: this.refundForm.accountName,
						bsb: this.refundForm.bsb,
						accountNumber: this.refundForm.accountNumber
					};
					this.$http.post(this.$api.bondRefund, data).then(res => {
						uni.showToast({
							title: "退还申请已提交",
							success: () => {
								setTimeout(() => {
									uni.reLaunch({
										url: "../user"
									});
								}, 500);
							}
						});
					});
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped src="../css/refund.scss"></style>
