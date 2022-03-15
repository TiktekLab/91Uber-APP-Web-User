<template>
	<view class="SystemItem flex" @click="ItemEvent(ItemDetails, itemIndex)">
		<view class="avatar"><image class="m-icon" src="@/static/icon/SystemIcon.png" mode="aspectFill" /></view>
		<view class="itemInfo">
			<view class="nameBox flex-space-between">
				<text :class="['name', { strong: ItemDetails.isRead === 0 }]">91Uber</text>
				<text class="time">{{ ItemDetails.createTime | timeHmdm }}</text>
			</view>
			<view class="info flex-start">
				<text :class="['TwoLines', { strong: ItemDetails.isRead === 0 }]">{{ ItemDetails.title || "" }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
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
	}
};
</script>

<style lang="scss">
.SystemItem {
	padding: 30rpx;

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
			-webkit-line-clamp: 2;
			overflow: hidden;
			display: -webkit-box;
			-webkit-box-orient: vertical;

			color: #a4a0a0;
			&.strong {
				font-weight: bold;
				color: #000;
			}
		}

		.nameBox {
			margin-bottom: 20rpx;

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
	}
}
</style>
