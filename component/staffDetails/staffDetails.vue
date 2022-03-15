<template>
	<view v-if="staffDetails.id" class="flex-space-between staffDetails" @click="navigateTo">
		<view class="avatar"><image class="m-icon" :src="staffDetails.avatar" mode="aspectFill" /></view>
		<view class="info ">
			<view class="name flex-start">
				<text>{{ staffDetails.username }}</text>
			</view>
			<view class="flex-start details">
				<text>{{ staffDetails.age }}岁</text>
				<text>{{ staffDetails.height }}cm</text>
				<text>{{ staffDetails.bust }}</text>
				<text>{{ staffDetails.weight }}kg</text>
				<text class="address">{{ staffDetails.street }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		staffDetails: { type: Object, default() { return {} } }
	},
	methods: {
		navigateTo() {
			uni.navigateTo({
				url: "/pages/heart/userDetails/userDetails?id=" + this.staffDetails.id
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.staffDetails {
	height: 200rpx;
	border-top: 30rpx solid #f9f9f9;
	border-bottom: 30rpx solid #f9f9f9;
	box-sizing: content-box;
	.avatar {
		width: 270rpx;
		height: 100%;
	}
	.info {
		background-color: #fff;
		height: 100%;
		padding: 30rpx;
		flex: 1;
		flex-direction: column;
		.name {
			text {
				font-size: 30rpx;
				font-family: PingFangSCBold;
				color: #000;
			}
		}
		.details {
			flex-wrap: wrap;
			text {
				font-size: 26rpx;
				color: #6b7582;
				margin-right: 20rpx;
				&.address {
					-webkit-line-clamp: 2;
					overflow: hidden;
					display: -webkit-box;
					-webkit-box-orient: vertical;
				}
			}
		}
	}
}
</style>
