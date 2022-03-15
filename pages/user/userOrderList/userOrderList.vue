<template>
	<view class="bodyMain bodyBG">
		<u-navbar title="我的订单" />
		<view class=" subSection">
			<u-subsection @change="sectionChange" :list="orderStatus" active-color="#ff36a2" :current="tabCurrent" font-size="26rpx" bg-color="rgba(0,0,0,.1)" />
		</view>
		<view class="orderList">
			<mescroll-body offset="300" ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getData" :up="upOption">
				<view class="listItem" v-for="(item, index) in orderList" :key="index" @click="navigateToOrderDetails(item.id)">
					<view class="avatar ">
						<image class="m-icon" :src="item.employeeAvatar" mode="aspectFill" />
						<view class="tagBox flex-space-between">
							<view class="left flex-start">
								<text class="flex-center tag">{{ item.orderType ? "外卖 Outcall" : "堂食" }}</text>
							</view>
						</view>
					</view>
					<view class="staffInfo">
						<view class="nameBox flex-space-between ">
							<text class="name">{{ item.employeeName }}</text>
							<text class="status" v-if="item.orderType === 1">{{ outCallStatus(item.status) }}</text>
							<text class="status" v-if="item.orderType === 0">{{ statusTxt(item.status) }}</text>
						</view>
						<view class="infos flex-start">
							<text class="flex-center">{{ formatDate(item.startTime) }}-{{ formatTime2(item.endTime) }}</text>
						</view>
					</view>
				</view>
			</mescroll-body>
		</view>
	</view>
</template>

<script>
import moment from "moment";
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
export default {
	mixins: [MescrollMixin], // 使用mixin
	data() {
		return {
			upOption: {
				textNoMore: "-- 没有更多数据 --",
				noMoreSize: 0
			},
			orderStatus: [
				{
					name: "进行中（0）"
				},
				{
					name: "历史订单"
				}
			],
			tabCurrent: 0, // 当前选中的tab
			orderList: [] // 订单数据
		};
	},
	onReady() {
		uni.$on("autoUpdateByPushMsg", () => {
			this.mescroll.resetUpScroll();
		})
	},
	methods: {
		// 下拉加载刷新上拉加载
		downCallback() {
			this.mescroll.resetUpScroll();
		},
		getData(page) {		
			const params = {
				isFinish: this.tabCurrent,
				pageNum: 1,  //去重需要，一直传1
				pageSize: page.size
			}
			if (page.num > 1) {					
				if(this.tabCurrent === 0) {
					params.idMax = this.orderList[this.orderList.length-1].id;
				} else {
					params.updateTimeMax = this.orderList[this.orderList.length-1].updateTime;
				}
			}			
			this.$http.get(this.$api.orderList, params).then(res => {
					if (page.num == 1) this.orderList = []; //如果是第一页需手动置空列表
					this.orderList = this.orderList.concat(res.list);
					console.log("订单列表：", this.orderList);
					this.mescroll.endBySize(res.list.length, res.count);
					if (this.tabCurrent === 0) {
						this.$set(this.orderStatus[0], "name", `进行中（${res.count}）`);
					}
				}).catch(err => {
					this.mescroll.endErr();
				});
		},
		formatDate(time) {
			if (time) {
				return moment(time.replace("T", " ")).locale("zh-cn").format("ddd MMM DD日 yyyy HH:mm");
			}
			return "";
		},
		formatTime2(time) {
			if (time) {
				return moment(time.replace("T", " ")).format("HH:mm");
			}
			return "";
		},
		navigateToOrderDetails(id) {
			uni.navigateTo({
				url: "/pages/heart/orderDetails/orderDetails?orderId=" + id
			});
		},
		sectionChange(e) {
			this.tabCurrent = e;
			this.getData({
				num: 1,
				size: 10
			});
		}
	},
	computed: {
		formatTime() {
			return time => {
				if (time) {
					return moment(time.replace("T", " ")).format("DD/MM/YYYY HH:mm");
				}
				return "";
			};
		},
		statusTxt() {
			//5.6历史订单，其它进行中订单
			return status => {
				switch (status) {
					case 0:
						return "已下单";
					case 1:
						return "已确认";
					case 2:
						return "确认到达";
					case 3:
						return "已发送详细地址";
					case 4:
						return "开始工作";
					case 5:
						return "已完成";
					case 6:
						return "订单取消";
					default:
						return "";
				}
			};
		},
		outCallStatus() {
			//5.6历史订单，其它进行中订单
			return status => {
				switch (status) {
					case 0:
						return "已下单";
					case 1:
						return "已确认";
					case 2:
					case 3:
					case 4:
						return "开始工作";
					case 5:
						return "已完成";
					case 6:
						return "订单取消";
					default:
						return "";
				}
			};
		}
	},
	onUnload() {
		uni.$off("autoUpdateByPushMsg");
	}
};
</script>

<style lang="scss" scoped src="../css/userOrderList.scss"></style>
