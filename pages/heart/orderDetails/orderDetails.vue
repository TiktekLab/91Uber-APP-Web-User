<template>
	<view class="bodyMain hideScroll">
		<u-navbar :title="pageTitle"  title-width="350"/>
		<staffDetails :staffDetails="staffInfo" />
		<view class="orderDetails padding">
			<view class="orderStatus flex-start m-radius">
				<text>{{ statusTxt() }}</text>
			</view>
			<text class="orderId flex">订单号：{{ orderDetails.orderSerial }}</text>
			<view class="itemList">
				<text class="pageTitle">预约类型</text>
				<view class="centent flex">
					<text>{{ orderDetails.orderType ? "外卖 Outcall" : "堂食" }}</text>
				</view>
			</view>
			<view class="itemList">
				<text class="pageTitle">预约日期</text>
				<view class="centent flex">
					<text>{{ formatDate(orderDetails.startTime) }}</text>
				</view>
			</view>
			<view class="itemList">
				<text  :class="['pageTitle',{pink:orderType === 0}]">{{ orderType === 1 ? "约会联系方式" : "约会地址" }}</text>
				<view class="centent flex" v-if="orderType === 1">
					<text >{{ orderDetails.receiverName }} {{ orderDetails.receiverPhone }}</text>
					<text>{{ orderType === 1 ? orderDetails.receiverAddress : orderDetails.receiverVagueAddress }}</text>
				</view>
				<view class="centent flex" v-else>
					<text>{{orderDetails.receiverAddress ? orderDetails.receiverAddress : orderDetails.receiverVagueAddress}}</text>
				</view>
			</view>
			<view class="itemList">
				<text class="pageTitle">预约时间</text>
				<view class="centent flex">
					<text>{{ formatTime(orderDetails.startTime) }} - {{ formatTime(orderDetails.endTime) }}</text>
					<text>共计：{{ allPrice(orderDetails.endTime, orderDetails.startTime) }} 分钟</text>
					<text>总价：{{ formatPrice(orderDetails.price) }}</text>
					<text>定金：{{ formatPrice(orderDetails.bond) }}</text>
					<text v-if="orderDetails.orderType === 0">支付商家：{{ formatPrice(orderDetails.price - orderDetails.bond) }}</text>
					<text v-else>支付商家：{{ formatPrice(orderDetails.bond / 2) }}</text>
				<!-- <text>定金：{{ deposit.isRatio ? formatPrice(orderDetails.price * deposit.bond/100) : deposit.bond }}</text>
					<text>支付商家：{{ deposit.isRatio ? formatPrice(orderDetails.price * (1- deposit.bond/100)) : orderDetails.price - deposit.bond }}</text> -->
					<text>(此费用不包括外卖的车油费)</text>
				</view>
			</view>
		</view>
		<view class="Tips">
			<text v-if="orderDetails.orderType === 0">
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
			<text v-else>
				温馨提示：
				<br />
				如有订单变更，请商家第一时间联系客户并进行协商，到达后请立刻要求客户支付订单余额并点击“员工已到达”。
				<br />
				约会开始前，客户请第一时间检查约会对象已年满18岁和相关工作许可证明。
				<br />
				如有其他问题请查看91UBER相关新手指南。
			</text>
		</view>
		<view :class="['footerBtn padding ', { isAndroid: isAndroid }]" v-if="orderType === 0">
			<!-- plain：白底红字+红边框 -->
			<!-- disable：灰底白字 -->
			<!-- big：大按钮 -->
			<view class="flex-end" v-if="orderDetails.status === 0">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="isModal('0')">取消预约</u-button>
			</view>
			
			<view v-if="orderDetails.status === 1">
				<view class="flex-end">
					<u-button hover-class="none" plain class="btn plain pink m-btn" @click="isModal('0')">取消预约</u-button>
					<u-button v-if="orderDetails.isCanPutOff" hover-class="none" plain class="btn pink m-btn" @click="isModal('2')">我已到达</u-button>
					<u-button v-else hover-class="none" plain class="btn disable pink m-btn" @click="isModal('22')">我已到达</u-button>
					<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
				</view>
			</view>

			<view class="flex-end" v-if="orderDetails.status === 2">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
				<u-button hover-class="none" plain class="btn big disable m-btn">我已到达-等待精确地址</u-button>				
			</view>
			
			<view class="flex-end" v-if="orderDetails.status === 5">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
				<u-button v-if="!orderDetails.score" hover-class="none" plain class="btn plain pink m-btn" @click="isModal('4')">前往评价</u-button>
			</view>
			
			<view class="flex-end" v-if="orderDetails.status == 3 || orderDetails.status == 4 || orderDetails.status == 6">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
			</view>
		</view>
		<view v-if="orderType === 1" :class="['footerBtn padding ', { isAndroid: isAndroid }]">
			<!-- plain：白底红字+红边框 -->
			<!-- disable：灰底白字 -->
			<!-- big：大按钮 -->
			<view class="flex-end" v-if="orderDetails.status === 0">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="isModal('0')">取消预约</u-button>
			</view>
			
			<view class="flex-end" v-if="orderDetails.status === 1">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="isModal('0')">取消预约</u-button>
				<u-button v-if="orderDetails.isCanPutOff" hover-class="none" plain class="btn pink m-btn" @click="orderBegin()">员工已到达</u-button>
				<u-button v-else hover-class="none" plain class="btn disable pink m-btn" @click="isModal('23')">员工已到达</u-button>
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
			</view>

			<view class="flex-end" v-if="orderDetails.status === 5">
				<u-button v-if="!orderDetails.score" hover-class="none" plain class="btn plain pink m-btn" @click="isModal('4')">前往评价</u-button>
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
			</view>
			
			<view class="flex-end" v-if="orderDetails.status == 6">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
			</view>			
			
			<view class="flex-end" v-if="orderDetails.status == 2 || orderDetails.status == 3 || orderDetails.status == 4">
				<u-button hover-class="none" plain class="btn plain pink m-btn" @click="aboutUs()">联系客服</u-button>
			</view>
		</view>
		<!-- 弹框 -->
		<u-modal v-model="isShowModal" :content="content" :title="title" show-cancel-button :confirm-text="confirmText" @confirm="Confirm"></u-modal>
	</view>
</template>

<script>
import moment from "moment";
import staffDetails from "@/component/staffDetails/staffDetails.vue";
import { updateSetLoginUserInfo } from "@/common/js/storeCommon.js";
//取消订单24小时以内或者以外
const criticalHour = 24 * 60 * 60 * 1000;
export default {
	components: {
		staffDetails
	},
	onLoad(option) {
		this.orderId = decodeURIComponent(option.orderId);
		this.getOrder();
		let routes = getCurrentPages();
		this.currentRouterInfo = routes[routes.length - 2]; //上个页面
	},
	onBackPress(option) {
		const route = "pages/heart/bookingDetails/bookingDetails";
		if (this.currentRouterInfo.route === route) {
			console.log('预约详情',option);
			if (option.from === "navigateBack") {
				return false;
			}
			this.back(3);
			return true;
		} else {
			return false;
		}
	},
	onReady() {		
		uni.$on("autoUpdateByPushMsg", () => {
			this.getOrder();
		});		
	},
	data() {
		return {
			currentRouterInfo: undefined,
			orderId: undefined, // 订单类型
			orderType: 0,
			orderDetails: {},
			staffInfo: {},
			isShowModal: false, // 是否显示提醒弹框
			content: "确认后商家将会发送精确地址", // 消息弹框内容
			title: "确认到达", // 消息弹框标题
			confirmText: "确认",
			modalType: undefined,
			deposit: {},
		};
	},
	methods: {
		getConfigBond() {
			const api = this.orderDetails.orderType === 0 ? this.$api.getBond : this.$api.getBondOutCall;
			this.$http.get(api).then(res => {
				this.deposit = res;
			});
		},
		back(index) {
			uni.navigateBack({
				delta: index
			});
		},
		getOrder() {
			this.$http.get(this.$api.orderDetails + this.orderId).then(res => {
				this.orderDetails = res.labourOrder;
				//console.log("订单详情：", this.orderDetails);
				this.orderType = this.orderDetails.orderType;		
				//this.getConfigBond();
				this.employeeSimple(this.orderDetails.employeeId);		
			});
		},
		orderCancel() {
			this.$http.post(this.$api.customerRepentance(this.orderId)).then(res => {
				updateSetLoginUserInfo();
				this.getOrder();
			});
		},
		orderArrivals() {
			this.$http.post(this.$api.customerArrivals(this.orderId)).then(res => {
				this.getOrder();
			});
		},
		//员工已到达，开始服务
		orderBegin(){
			this.$http.post(this.$api.orderBegin(this.orderId)).then(res => {
				this.getOrder();
				uni.$emit("updateMessage", {
					reset: true,
					noticeType: 2
				});
			});
		},
		orderPutOff() {
			this.$http.post(this.$api.customerPutOff(this.orderId)).then(res => {
				this.getOrder();
			});
		},
		employeeSimple(staffId) {
			this.$http.get(this.$api.employeeSimple(staffId)).then(res => {
				this.staffInfo = res.employee;
				// console.log('员工详情：',this.staffInfo);
			});
		},
		isModal(e) {
			if (e === "0") {
				this.title = "确认取消";				
				if(this.orderDetails.status === 1){  // 商家已接单
					const nowTime = moment();
					const orderStart = moment(this.orderDetails.startTime.replace("T", " "));
					const diffTime = orderStart.diff(nowTime);
					if(this.orderDetails.orderType === 0) {
						this.content = diffTime > criticalHour ? "您是否要取消此订单？离预约时间开始在24小时以外定金将在24小时内转入app内个人账户。" : "您是否要取消此订单？离预约时间开始短于24小时将扣除定金。";	
					} else {
						this.content = diffTime > criticalHour ? "您是否要取消此订单？离预约时间开始在24小时以外定金将转入app内个人账户。" : "您是否要取消此订单？离预约时间开始短于24小时将扣除定金。";	
					}					
				} else {
					this.content = "确认后会取消订单";
				}
			} else if (e === "1") {
				this.title = "申请迟到";
				this.content = "迟到时间不得超过30分钟";
			} else if (e === "2") {
				this.title = "确认到达";
				this.content = "确认后商家将会发送精确地址";
			} else if (e === "22") {
				this.title = "我已到达";
				this.content = "约会前15分钟“我已到达”按钮将被激活，点击后商家会给您发送精确地址";
			} else if (e === "23") {
				this.title = "员工已到达";
				this.content = "约会前15分钟“员工已到达”按钮将被激活";
			} else if (e === "3") {
				this.title = "联系客服";
				this.content = "查看平台联系方式";
				this.confirmText = "前往";
				if(this.orderType === 1){
					this.title = "延迟申请";				
				}
			} else if (e === "4") {
				this.title = "前往评价";
				this.content = "确认前往评价";
			}
			if (e !== "3") {
				this.confirmText = "确认";
			}
			this.isShowModal = !this.isShowModal;
			this.modalType = e;
		},
		Confirm() {
			switch (this.modalType) {
				case "0":
					this.orderCancel();
					break;
				case "1":
					this.orderPutOff();
					break;
				case "2":
					this.orderArrivals();
					break;
				case "3":
					this.aboutUs();
					break;
				case "4":
					this.evaluateBooking();
					break;
			}			
		},
		aboutUs() {
			// 联系客服
			uni.navigateTo({
				url: "../../user/contactUs/contactUs"
			});
		},
		evaluateBooking() {
			uni.navigateTo({
				url: `../evaluate/evaluate?orderId=${this.orderId}&staffId=${this.orderDetails.employeeId}`
			});
		},
		formatDate(time) {
			if (time) {
				return moment(time.replace("T", " ")).locale("zh-cn").format("ddd MMM DD日 yyyy");
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
		pageTitle() {
			if (this.orderType === 0) {
				return "堂食-订单详情";
			}
			return "外卖 Outcall-订单详情";
		},
		allPrice() {
			return (end, start) => {
				return moment(end).diff(moment(start), "minutes");
			};
		},
		statusTxt() {
			//5.6历史订单，其它进行中订单
			return () => {
				let status = this.orderDetails.status;
				if (this.orderType === 0) {
					switch (status) {
						case 0:
							return "等待商家确认";
						case 1:
							return "订单已确认";
						case 2:
							return "等待商家发送房号";
						case 3:
							return "商家已向您发送了具体房间号，请立刻按门铃，到达后请第一时间检查商家是否已满18周岁以及工作许可证明";
						case 4:
							return "订单已确认";
						case 5:
							return "订单已完成";
						case 6:
							return "订单已取消";
						default:
							return "";
					}
				} else {
					switch (status) {
						case 0:
							return "等待商家确认";
						case 1:
							return "商家已接单";
						case 4:
							return "订单已确认";
						case 5:
							return "订单已完成";
						case 6:
							return "订单已取消";
						default:
							return "";
					}
				}
			};
		}
	},
	onUnload() {
		uni.$off("autoUpdateByPushMsg");
	}
};
</script>

<style lang="scss" scoped src="../css/orderDetails.scss"></style>
