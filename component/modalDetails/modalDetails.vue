<template>
	<u-mask :show="visible">
		<view class="warp ">
			<view class="modalBox ">
				<view class="top flex-center">
					<view class="avatar">
						<image class="m-icon" :src="orderDetailsInfo.employeeAvatar" mode="aspectFill"></image>
					</view>
					<text class="name">{{orderDetailsInfo.employeeName}}</text>
					<view class="closeIcon">
						<u-icon name="close" @click="modalClose" />
					</view>
				</view>
				<view class="timeBox" v-if="orderDetailsInfo.orderType === 0">
					<view class="startTime Time">
						<text class="iconfont green">&#xe601;</text>
						<text>{{orderDetailsInfo.startTime|timeFormat}}</text>
					</view>
					<view class="endTIme Time">
						<text class="iconfont pink">&#xe601;</text>
						<text>{{orderDetailsInfo.endTime|timeFormat}}</text>
					</view>
				</view>
				<view class="timeBox" v-else></view>
				<text class="aboutTxt" v-if="orderDetailsInfo.orderType === 1">联系方式：</text>
				<view class="address flex" v-if="orderDetailsInfo.orderType === 0">
					<text>{{orderDetailsInfo.employeeName}}</text>
					<text class="dizhi">{{showAddress}}</text>
				</view>
				<view class="address flex outAddress" v-else>
					<text>联系方式：</text>
					<text class="phoneTxt">{{orderDetailsInfo.receiverPhone}}</text>
					<text>详细地址：</text>
					<text class="dizhi">{{ orderDetailsInfo.receiverAddress }}</text>
				</view>

				<view class="btnGroup flex-end" v-if="orderDetailsInfo.orderType === 0">
					<!-- 禁用：disable 不可用：btn 可用：pink -->
					<!-- 0已下单 1店铺已接单 2确认到达 3店铺已发送详细地址 4开始工作 5结束工作 6订单取消 -->
					<text class="btn" v-if="orderDetailsInfo.status<4"
						@click.stop="Repentance">反悔</text>
					<text class="btn" v-if="orderDetailsInfo.status<4 && !orderDetailsInfo.receiverAddress"
						@click.stop="$noMultipleClicks(customerPutOff)">迟到15mins</text>
					<text class="btn pink" v-if="orderDetailsInfo.status===1"
						@click.stop="$noMultipleClicks(customerArrivals)">已到达</text>
					<text class="btn disable" v-if="orderDetailsInfo.status===2">等待接收完整地址</text>
				</view>
				<!-- OutCall 订单 -->
				<view class="btnGroup flex-end" v-else>
					<text class="btn pink" @click="modalClose">确认</text>
				</view>
			</view>
		</view>
		<!-- 是否确认 -->
		<u-modal v-model="isShowModal" title="" @confirm="$noMultipleClicks(customerRepentance)" show-cancel-button confirm-color="#f1598e"
			content="确认反悔吗？"></u-modal>
	</u-mask>
</template>

<script>
	import moment from 'moment';
	export default {
		props: {
			visible: {
				type: Boolean,
				required: true
			},
			orderDetailsInfo: {
				type: Object,
				default: {}
			},
		},
		filters: {
			timeFormat(time) {
				return moment(time?.replace('T', ' ')).format('DD/MM/YYYY HH:mm');
			}
		},
		data() {
			return {
				noClick: true, //重复点击	
				isShowModal: false,
			};
		},
		computed: {
			showAddress() { //显示地址类型
				if (this.orderDetailsInfo) {
					let status = this.orderDetailsInfo.status;
					if (status !== 6) {
						return status < 3 ? '模糊地址：' + this.orderDetailsInfo.receiverVagueAddress : '完整地址：' + this
							.orderDetailsInfo.receiverAddress
					} else {
						if (this.orderDetailsInfo.receiverAddress) {
							return '完整地址：' + this.orderDetailsInfo.receiverAddress
						}
						return '模糊地址：' + this.orderDetailsInfo.receiverVagueAddress;
					}
				}
				return undefined;
			}
		},
		methods: {
			Repentance() {  //  确认反悔弹框
				this.isShowModal = !this.isShowModal;
			},
			customerRepentance() { //客户反悔订单
				this.$http.post(this.$api.customerRepentance(this.orderDetailsInfo.id)).then(res => {
					this.refreshData()
					uni.showToast({
						title: '订单已取消',
						icon: 'none',
						duration: 1000
					})
					setTimeout(() => {
						this.modalClose()
					}, 1000)
				})
			},
			customerPutOff() { //客户推迟订单
				this.$http.post(this.$api.customerPutOff(this.orderDetailsInfo.id)).then(res => {
					this.refreshData()
					uni.showToast({
						title: '已向对方发出迟到消息',
						icon: 'none',
						duration: 1000
					})
					setTimeout(() => {
						this.modalClose()
					}, 1000)
				})
			},
			customerArrivals() { //客户已到达指定区域
				this.$http.post(this.$api.customerArrivals(this.orderDetailsInfo.id)).then(res => {
					this.refreshData()
					uni.showToast({
						title: '提交成功，请等待对方发送完整地址',
						icon: 'none',
						duration: 1000
					})
					setTimeout(() => {
						this.modalClose()
					}, 1000)
				})
			},
			modalClose() {
				this.$emit("modalClose", {
					isClose: true
				});
			},
			refreshData() {
				this.$emit("refreshData", {
					isRefresh: true
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.warp {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;

		.modalBox {
			width: 600rpx;
			border-radius: 10rpx;
			padding: 0 60rpx 60rpx;
			background-color: #fff;

			.top {
				position: relative;
				flex-direction: column;

				.avatar {
					width: 160rpx;
					height: 160rpx;
					border-radius: 50%;
					overflow: hidden;
					-webkit-transform: rotate(0deg);
					margin-top: -80rpx;
					flex: 0 0 160rpx;
				}

				.name {
					font-size: 36rpx;
					font-family: 'PingFangSCBold';
				}

				.closeIcon {
					position: absolute;
					right: -20rpx;
					top: 30rpx;
				}
			}

			.timeBox {
				margin: 40rpx 0;

				.Time {
					margin: 10rpx 0;

					text {
						font-size: 24rpx;
						color: $font-color-gray;

						&.green {
							color: $success;
						}

						&.pink {
							color: $pink;
						}
					}
				}
			}

			.aboutTxt {
				font-size: 24rpx;
				margin-bottom: 30rpx;
				display: flex;
			}

			.address {
				flex-direction: column;
				background-color: rgba(239, 246, 249, .5);
				padding: 10rpx;
				border-radius: 10rpx;
				overflow: hidden;

				text {
					font-size: 24rpx;
					line-height: 1.5;
				}

				&.outAddress {
					padding: 10rpx 20rpx;

					.phoneTxt {
						margin-bottom: 20rpx;
					}
				}
			}

			.btnGroup {
				margin: 40rpx -15rpx 0;
				flex-wrap: wrap;

				.btn {
					color: #fff;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: #D3D3D3;
					border-radius: 6rpx;
					font-size: $font-size-base;
					margin: 10rpx 10rpx 10rpx 0;
					padding: 5rpx 15rpx;
					min-width: 120rpx;

					&.pink {
						background-color: $pink;
					}

					&.disable {
						background-color: #FFAAC8;
					}

					&:last-child {
						margin-right: 0;
					}
				}
			}
		}
	}
</style>
