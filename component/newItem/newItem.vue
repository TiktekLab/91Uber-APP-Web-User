<template>
	<view class="newItem flex" @click="ItemEvent(100, itemIndex, ItemDetails.associateId, ItemDetails.employeeId)">
		<view class="avatar">
			<image class="m-icon" :src="ItemDetails.avatar || avatarUrl(14)" mode="aspectFill" />
		</view>
		<view class="itemInfo">
			<view class="nameBox flex-space-between">
				<text :class="['name', { strong: !ItemDetails.isRead }]">{{ ItemDetails.username }}</text>
				<text class="time">{{ ItemDetails.createTime | timeHmdm }}</text>
			</view>
			<view class="info flex-start">
				<!-- 未读消息添加 strong 样式 -->
				<text v-if="showType === 0" :class="['TwoLines', { strong: !ItemDetails.isRead }]">{{ ItemDetails.content }}</text>
				<text v-else :class="['TwoLines', { strong: ItemDetails.isRead === 0 }]">{{ ItemDetails.title }}</text>
			</view>
			<view v-if="ItemDetails.startTime && ItemDetails.endTime" class="ExactAddress flex-start">
				<text class="address TwoLines">{{ getOrderTime(ItemDetails) }}</text>
			</view>
			<view v-else-if="ItemDetails.description" class="ExactAddress flex-start">
				<text class="address TwoLines">{{ ItemDetails.description }}</text>
			</view>
			<view v-if="showType === 0" class="btnGroup flex-end">
				<u-button v-if="ItemDetails.type === 5 && ItemDetails.status === 1" hover-class="none" plain class="btn pink m-btn" @click="ItemEvent(1, itemIndex, ItemDetails.associateId, ItemDetails.employeeId)">
					我已到达
				</u-button>
				<u-button v-if="ItemDetails.type === 5 && ItemDetails.status === 2" hover-class="none" plain class="btn disable m-btn">
					确认到达
				</u-button>
				<u-button v-if="ItemDetails.type === 10 && ItemDetails.status === 5 && !ItemDetails.score" hover-class="none" plain class="btn plain m-btn" @click="ItemEvent(2, itemIndex, ItemDetails.associateId, ItemDetails.employeeId)">
					前往评价
				</u-button>
				<u-button v-if="ItemDetails.type === 10 && ItemDetails.status === 5 && ItemDetails.score" hover-class="none" plain class="btn disable m-btn">
					已评价
				</u-button>
			</view>
			<view v-else class="btnGroup flex-end">
				<u-button v-if="ItemDetails.type === 5 && ItemDetails.status === 1" hover-class="none" plain class="btn pink m-btn" @click="ItemEvent(3, itemIndex, ItemDetails.associateId, ItemDetails.employeeId)">
					员工已到达
				</u-button>
				<u-button v-if="ItemDetails.type === 5 && ItemDetails.status === 2" hover-class="none" plain class="btn disable m-btn">
					确认到达
				</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import moment from "moment";
	export default {
		props: {
			showType: {
				//0.订单提醒，1.我的关注
				type: [Number, String],
				require: false,
				default: null
			},
			itemIndex: {
				type: Number
			},
			ItemEvent: {
				type: Function
			},
			ItemDetails: {
				type: Object,
				default: {}
			}
		},
		methods: {
			getOrderTime(item) {
				return moment(item.startTime.replace('T', ' ')).format('ddd MMM DD,HH:mm') + "-" + moment(item.endTime.replace('T', ' ')).format('HH:mm');
			}
		}
	};
</script>

<style lang="scss">
	.newItem {
		padding: 30rpx;
		border-bottom: 2rpx solid #eee;

		&:last-child {
			border-bottom: 0;
		}

		.avatar {
			width: 100rpx;
			height: 100rpx;
			flex: 0 0 100rpx;

			image {
				border-radius: 50%;
				overflow: hidden;
			}
		}

		.itemInfo {
			margin-left: 20rpx;
			flex: 1;

			.TwoLines {
				// -webkit-line-clamp: 2;
				// overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;

				color: #a4a0a0;

				&.strong {
					font-weight: bold;
					color: #000;
				}
			}

			.nameBox {
				margin-bottom: 10rpx;

				text {
					margin: 0;
					line-height: 1;
					color: #a4a0a0;

					&.name {
						font-family: PingFangSCBold;
					}

					&.strong {
						color: #000;
					}

					&.time {
						color: #a4a0a0;
					}
				}
			}

			.info {
				margin: 20rpx 0 10rpx;
			}

			.ExactAddress {
				.address {
					color: #a4a0a0;
				}
			}

			.btnGroup {
				margin-top: 20rpx;

				.btn {
					width: 200rpx;
					height: 64rpx;
					margin: 0 0 0 30rpx;

					&:first-child {
						margin: 0;
					}

					&.plain {
						background-color: #fff;
						border: 2rpx solid $pink;
						color: $pink;
					}

					&.disable {
						background-color: #a4a0a0;
						color: #fff;
					}
				}
			}
		}
	}
</style>
