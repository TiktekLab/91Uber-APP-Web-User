<template>
	<view class="listItem">
		<view class="avatar " @click="navigateToUserDetails(staffData.id)">
			<image class="m-icon" :src="staffData.avatar" mode="aspectFill" />
			<view class="tagBox flex-space-between">
				<view class="left flex-start">
					<text class="flex-center tag" style="marginRight:20rpx">{{ staffData.classifications }}</text>
					<text class="flex-center tag">${{ staffData.price }}/{{ staffData.minute/60 }}h</text>
				</view>
				<text class="flex-center staffStatus tag" v-if="staffData.status === 1">我有时间</text>
				<text class="flex-center staffStatus tag" v-else>等我有空</text>
			</view>
		</view>
		<view class="staffInfo">
			<view class="nameBox flex-space-between ">
				<text class="name">{{ staffData.username }}</text>
				<text v-if="isFollow(staffData.id)" class="iconfont active heart" @click="unFollow(staffData)">&#xe60f;</text>
				<text v-else class="iconfont heart" @click="follow(staffData)">&#xe60e;</text>
				<!-- <text class="iconfont heart">&#xe60e;</text> -->
			</view>			
			<view class="infos flex-start">
				<text>{{ staffData.city || 'AUS' }}, {{ staffData.province || 'AUS' }}{{ getPostCode(staffData.street) }}</text>
			</view>
			<view class="infos flex-start">
				<text class="flex-center">{{ staffData.age }}岁</text>
				<text class="flex-center">|</text>
				<text class="flex-center">{{ staffData.height }}cm</text>
				<text class="flex-center">|</text>
				<text class="flex-center">{{ staffData.bust || 'D' }}</text>
				<text class="flex-center">|</text>
				<text class="flex-center">{{ staffData.weight }}kg</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			staffData: {
				type: Object,
				require: true
			},
			unFollow: {
				type: Function
			},
			follow: {
				type: Function
			},
			followIds :{
				type: Array,
				default() {
					return [];
				}
			}
		},
		methods: {
			navigateToUserDetails(id) {
				uni.navigateTo({
					url: "/pages/heart/userDetails/userDetails?id=" + id
				});
			},
			isFollow(staffId) {
				return this.followIds.includes(staffId);
			},
			getPostCode(street) {
				if(street) {
					const str = street.replace(/\s+/g,'');
					const code =  str.substr(str.length - 4);
					const regex = /^[0-9]*$/
					if(regex.test(code)) return ', ' + code;					
				}
				return ''
			}
		}
	};
</script>

<style lang="scss" scoped>
	.listItem {
		margin-bottom: 40rpx;

		.avatar {
			width: 100%;
			height: 480rpx;
			position: relative;

			.tagBox {
				position: absolute;
				left: 30rpx;
				right: 30rpx;
				top: 30rpx;

				.tag {
					height: 48rpx;
					white-space: nowrap;
					box-shadow: 0rpx 0rpx 8rpx rgba(0, 0, 0, 0.1);
					line-height: 48rpx;
					text-align: center;
					background-color: #fff;
					color: #000;
					padding: 0 20rpx;
					border-radius: 48rpx;

					&.staffStatus {
						background-color: $pink;
						color: #fff;
					}
				}
			}
		}

		.staffInfo {
			padding: 30rpx;
			background-color: #fff;

			.nameBox {
				.name {
					font-size: 30rpx;
					font-family: PingFangSCBold;
					max-width: 620rpx;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				.heart {
					font-size: 40rpx;
					width: 40rpx;
					flex: 0 0 40rpx;
					margin-left: 30rpx;

					&.active {
						color: $pink;
					}
				}
			}

			.infos {
				padding: 10rpx 0;

				text {
					color: #6b7582;
					margin-right: 20rpx;
				}
			}
		}
	}
</style>
