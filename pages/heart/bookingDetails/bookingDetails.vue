<template>
	<view class="bodyMain">
		<u-navbar :title="pageTitle"  title-width="350"/>
		<staffDetails :staffDetails="staffInfo" />
		<!-- 外卖表单 -->
		<view v-if="orderType === 1" class="addForm">
			<text class="pageTitle">请填写您的地址</text>
			<u-form
				:model="addressForm" :error-type="['toast']" 
				ref="addressForm"
				class="form"
				:border-bottom="false"
				label-width="130"
				:label-style="{ fontSize: '26rpx', fontFamily: 'PingFangSCMedium' }"
			>
				<u-form-item label="*联系人" prop="name" :border-bottom="false">
					<input class="input" v-model="addressForm.name" placeholder-style="color:#A4A0A0" placeholder="请输入姓名" />
				</u-form-item>
				<u-form-item label="*电话+61" prop="phone" :border-bottom="false">
					<input class="input" v-model="addressForm.phone" placeholder-style="color:#A4A0A0" placeholder="请输入手机号" type="number" />
				</u-form-item>
				<u-form-item label="*地址" prop="address" :border-bottom="false">
					<input class="input" v-model="addressForm.address" placeholder-style="color:#A4A0A0" placeholder="请输入Street Address" />
				</u-form-item>
				<u-form-item label="房间号" :border-bottom="false">
					<input class="input" v-model="addressForm.roomNumber" placeholder-style="color:#A4A0A0" placeholder="apartment, suit, unit etc" />
				</u-form-item>
			</u-form>
		</view>
		<view class="bookingDetails padding">
			<view class="itemList">
				<text class="pageTitle">预约类型</text>
				<view class="centent flex">
					<text>{{ orderType ? "外卖 Outcall" : "堂食" }}</text>
				</view>
			</view>
			<view class="itemList">
				<text class="pageTitle">预约日期</text>
				<view class="centent flex">
					<text>{{ formatDate(employeePrice.startTime) }}</text>
				</view>
			</view>
			<view class="itemList">
				<text class="pageTitle">预约时间</text>
				<view class="centent flex">
					<text>{{ formatTime(employeePrice.startTime) }} - {{ formatTime(employeePrice.endTime) }}</text>
					<text>共计：{{ employeePrice.minutePick }} 分钟</text>
					<text>总价：{{ formatPrice(employeePrice.amt) }}</text>
					<text>定金：{{ formatPrice(employeePrice.bond) }}</text>
					<text v-if="orderType === 0">支付商家：{{ formatPrice(employeePrice.amt - employeePrice.bond)}}</text>
					<text v-else>支付商家：{{ formatPrice(employeePrice.bond / 2)}}</text>
					<text>(此费用不包括外卖的车油费)</text>
				</view>
			</view>
			<view class="itemList">
				<text v-if="orderType === 0" class="tips">
					温馨提示：
					<br />
					“我已到达”按钮将在约会开始前15分钟启动。
					<br />
					请客户按照预约时间准时到达约会地址，迟到有可能取消您的订单，请点击“我已到达”获取房号。
					<br />
					请商家注意订单状态更新，及时发送房号。
					<br />
					约会开始前，客户请第一时间检查约会对象已年满18岁和相关工作许可证明，商家收取订单余额。
					<br />
					如有其他问题请查看91UBER相关新手指南。
				</text>
				<text v-else class="tips">
					温馨提示：
					<br />
					如有订单变更，请商家第一时间联系客户并进行协商，到达后请立刻要求客户支付订单余额并点击“员工已到达”。
					<br />
					约会开始前，客户请第一时间检查约会对象已年满18岁和相关工作许可证明。
					<br />
					如有其他问题请查看91UBER相关新手指南。
				</text>
			</view>
		</view>

		<view :class="['footerBtn padding flex', { isAndroid: isAndroid }]">
			<view class="left">
				<!-- 打折价 -->
				<view class="flex-start priceBox">
					<text class="allPrice">总价：</text>
					<text class="money">{{ formatPrice(employeePrice.amt) }}</text>
				</view>
				<!-- 原价 -->
				<!-- <view v-if="employeePrice.amtMax" class="flex-start priceBox">
					<text class="allPrice"></text>
					<text class="gray">{{ formatPrice(employeePrice.amtMax) }}</text>
				</view> -->
			</view>
			<view class="right"><u-button hover-class="none" :loading="isLoading" @click="confirmBook" plain class="confirm pink  m-btn">确定预约</u-button></view>
		</view>
		<u-modal v-model="isShowModal" content="您的个人账户余额不足，请及时充值。" title="余额不足" show-cancel-button confirm-text="前往" @confirm="confirmPay(true)"></u-modal>
	</view>
</template>

<script>
import { mapState } from "vuex";
import moment from "moment";
import staffDetails from "@/component/staffDetails/staffDetails.vue";
import { updateSetLoginUserInfo } from "@/common/js/storeCommon.js";
const rules = require("@/common/js/rules.js"); // 表单校验
export default {
	components: {
		staffDetails
	},
	onLoad(option) {	
		this.orderType = Number(decodeURIComponent(option.orderType));
		this.staffId = Number(decodeURIComponent(option.staffId));
		this.employeePrice = JSON.parse(decodeURIComponent(option.employeePrice));
		this.confirmPay(false);	
		this.employeeSimple();
	},
	onReady() {
		if (this.orderType === 1) {
			this.$refs.addressForm.setRules(this.rules);
		}
	},
	data() {
		return {
			isShowModal: false, // 是否显示弹框
			rules, // 表单验证
			orderType: undefined, // 订单类型
			isLoading: false,
			staffId: undefined,
			staffInfo: {},
			employeePrice: {
				minute: undefined,
				price: undefined,
				amt: undefined,
				amtMax: undefined,
				startTime: undefined,
				endTime: undefined,
				minutePick: undefined
			},
			addressForm: {
				name: undefined,
				phone: undefined,
				address: undefined,
				roomNumber: undefined
			}
		};
	},
	methods: {
		confirmBook() {
			// 确定预约
			const param = {
				employeeId: this.staffId,
				startTime: this.employeePrice.startTime,
				endTime: this.employeePrice.endTime,
				receiverName: this.addressForm.name,
				receiverPhone: this.addressForm.phone,
				orderType: this.orderType,
				receiverAddress:this.addressForm.address
			};
			if (this.addressForm.address && this.addressForm.roomNumber) {
				param.receiverAddress = this.addressForm.address + " " + this.addressForm.roomNumber;
			}

			if (this.orderType) {
				this.$refs.addressForm.validate(res => {
					if (res) {
						this.isLoading = true;
						this.$http.post(this.$api.addOrder, param, {isPrompt:false}).then(res => {
								updateSetLoginUserInfo();
								uni.$emit("autoUpdateByPushMsg");
								uni.$emit("updateStaffTime");
								const orderId = res.id;
								this.isLoading = false;
								uni.redirectTo({
									url: "../orderDetails/orderDetails?orderId=" + orderId
								});
							}).catch(err => {
								if (err.statusCode === "DS1005" && err.errMsg === "押金余额不足！") {
									this.isShowModal = true;
								} else {
									uni.showToast({
										title: err.errMsg,
										icon: "none",
										duration: 3000
									});	
								}
								this.isLoading = false;
							});
					} else {
						console.log("请填写约会地址");
					}
				});
			} else {
				this.isLoading = true;
				this.$http.post(this.$api.addOrder, param, {isPrompt:false}).then(res => {
						updateSetLoginUserInfo();
						uni.$emit("autoUpdateByPushMsg");
						const orderId = res.id;
						this.isLoading = false;
						uni.redirectTo({
							url: "../orderDetails/orderDetails?orderId=" + orderId
						});
					}).catch(err => {
						if (err.statusCode === "DS1005" && err.errMsg === "押金余额不足！") {
							this.isShowModal = true;
						} else {
							uni.showToast({
								title: err.errMsg,
								icon: "none",
								duration: 3000
							});	
						}
						this.isLoading = false;
					});
			}
		},
		confirmPay(type) {	
			const api = this.orderType === 0 ? this.$api.getBond : this.$api.getBondOutCall;
			this.$http.get(api).then(res => {
				let payMoney = 0;
				let bond ="";
				if(res.isRatio){
					payMoney = Number(this.employeePrice.amt) * res.bond / 100;
					bond = `订单金额的${res.bond}%`;
				} else {
					payMoney = res.bond;
					bond = this.formatPrice(res.bond);	
				}
				this.$set(this.employeePrice, "bond", payMoney);
				payMoney = Math.ceil(Math.abs(payMoney - this.loginUserInfo.bondBalance));
				if(type){
					uni.navigateTo({
						url: "../../user/pay/pay?payMoney=" + payMoney + "&bond=" + bond
					});
				}
			});
		},
		employeeSimple() {
			this.$http.get(this.$api.employeeSimple(this.staffId)).then(res => {
				//console.log("员工详情：", res.employee);
				this.staffInfo = res.employee;
			});
		},
		formatDate(time) {
			if (time) {
				return moment(time.replace("T", " ")).locale("zh-cn").format("ddd MMM Do yyyy");
			}
			return "";
		},
		formatTime(time) {
			if (time) {
				return moment(time.replace("T", " ")).format("HH:mm DD/MM/yyyy");
			}
			return "";
		}
	},
	computed: {
		...mapState({
			loginUserInfo: state => state.loginUserInfo
		}),
		pageTitle() {
			if (Number(this.orderType) === 0) {
				return "堂食-预约详情";
			}
			return "外卖 Outcall-预约详情";
		}
	}
};
</script>

<style lang="scss" scoped src="../css/bookingDetails.scss"></style>
