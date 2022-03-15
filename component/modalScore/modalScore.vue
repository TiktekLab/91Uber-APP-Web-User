<template>
	<u-mask :show="visible">
		<view class="warp ">
			<view class="modalBox ">
				<view class="top flex-center">
					<view class="avatar">
						<image class="m-icon" :src="orderDetailsInfo.employeeAvatar" mode="aspectFill"></image>
					</view>
					<text class="name">{{orderDetailsInfo.employeeName}}</text>
					<text class="score">{{orderEvaluation.id?'评分：'+orderEvaluation.score+'分':'给出您的评价!'}}</text>
					<view class="closeIcon">
						<u-icon name="close" @click="modalClose" />
					</view>
				</view>
				<view class="rateBox flex-center">
					<!-- 当用户提交了评价添加次属性：disabled="true" -->
					<u-rate inactive-icon="star-fill" size="50" gutter="20" active-color="#f1598e"
						v-model="orderEvaluation.score" :disabled="scoreAlready">
					</u-rate>
				</view>
				<view class="itemBox flex-start">
					<text class="item" :class="{ active: item.active }" v-for="item in evaluationLabels" :key="item.id"
						@click="selectItem(item)">{{ item.content }}</text>
				</view>
				<view class="btnGroup flex-end">
					<!-- 禁用：disable 不可用：btn 可用：pink -->
					<text class="btn pink flex-center" v-if="orderEvaluation.id" @click="modalClose">关闭</text>
					<text class="btn pink flex-center" v-else @click.stop="$noMultipleClicks(submitScore)">提交</text>
				</view>
			</view>
		</view>
	</u-mask>
</template>

<script>
	export default {
		props: {
			visible: {
				type: Boolean,
				required: true
			},
			orderDetailsInfo: {
				type: Object,
				default () {
					return {}
				}
			},
			evaluationLabels: {
				type: Array,
				default () {
					return []
				}
			},
			orderEvaluation: {
				type: Object,
				default () {
					return {}
				}
			}
		},
		data() {
			return {
				noClick: true, //重复点击	
			}
		},
		computed: {
			scoreAlready() {
				return 'id' in this.orderEvaluation;
			}
		},
		methods: {
			selectItem(data) {
				if (!this.scoreAlready) {
					this.$set(data, 'active', !data.active);
				}
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
			},
			submitScore() { //提交评价
				if (!this.orderEvaluation.score) {
					return uni.showToast({
						title: '请选择评分',
						icon: 'none'
					})
				}
				let checkedLabels = this.evaluationLabels.filter(t => t.active);
				if (!checkedLabels.length) {
					return uni.showToast({
						title: '请至少选择一个评价标签',
						icon: 'none'
					})
				}
				let labelIds = [];
				let labelTxts = [];
				checkedLabels.forEach(t => {
					labelIds.push(t.id);
					labelTxts.push(t.content);
				})
				this.$http.post(this.$api.orderScoreByCustomer, {
					orderId: this.orderDetailsInfo.id,
					score: this.orderEvaluation.score,
					evaluationLabelIds: labelIds
				}).then(res => {
					this.refreshData()
					uni.showToast({
						title: '评价成功',
						icon: 'none',
						duration: 1000
					})
					setTimeout(() => {
						this.modalClose();
					}, 1000)
				})
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

				.score {
					margin: 20rpx 0;
				}

				.closeIcon {
					position: absolute;
					right: -20rpx;
					top: 30rpx;
				}
			}

			.rateBox {
				margin: 40rpx auto;
			}

			.itemBox {
				flex-wrap: wrap;

				.item {
					color: #000;
					background-color: #d3d3d3;
					transition: all 0.15s;
					margin: 10rpx 10rpx 10rpx 0;
					padding: 5rpx 15rpx;
					border-radius: 6rpx;
					font-size: $font-size-base;

					&.active {
						color: #fff;
						transition: all 0.15s;
						background-color: $pink;
					}
				}
			}

			.btnGroup {
				margin: 40rpx -15rpx 0;
				flex-wrap: wrap;

				.btn {
					color: #fff;
					background-color: $pink;
					border-radius: 6rpx;
					font-size: $font-size-base;
					margin: 10rpx 10rpx 10rpx 0;
					padding: 5rpx 15rpx;
					min-width: 120rpx;
				}
			}
		}
	}
</style>
