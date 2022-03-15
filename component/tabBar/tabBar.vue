<template>
	<view :class="['m-tabBar flex-space-around',{isAndroidBox:isAndroid}]">
		<view :class="['tab flex-center',{ active: active === index },{isAndroid:isAndroid}]"
			v-for="(item, index) in tabList" @click.emit="tabClick(item, index)">
			<view class="icon flex-center">
				<!-- <text v-if="index===2 && isNews" class="iconfont spot">&#xe726;</text> -->
				<text v-if="index === 2 && totalUnreadCount && active === index" class="iconfont spot">&#xe726;</text>
				<text v-if="index === 2 && totalUnreadCount && active !== index" class="badge flex-center">{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</text>
				<image v-if="active === index" class="m-icon" :src="item.selectIcon" mode="aspectFill" />
				<image v-else class="m-icon" :src="item.icon" mode="aspectFill" />
			</view>
			<text class="text">{{ item.text }}</text>
		</view>
	</view>
</template>

<script>
	import { mapGetters } from "vuex";
	export default {
		data() {
			return {
				tabList: [{
						text: "搜索",
						icon: "/static/icon/tabBar/heart.png",
						selectIcon: "/static/icon/tabBar/heartActive.png",
						path: "/pages/heart/heart",
						midButton: true
					},
					{
						text: "列表",
						icon: "/static/icon/tabBar/list.png",
						selectIcon: "/static/icon/tabBar/listActive.png",
						path: "/pages/list/list",
						midButton: false
					},
					{
						text: "消息",
						icon: "/static/icon/tabBar/news.png",
						selectIcon: "/static/icon/tabBar/newsActive.png",
						path: "/pages/news/news",
						midButton: false
					},
					{
						text: "我的",
						icon: "/static/icon/tabBar/user.png",
						selectIcon: "/static/icon/tabBar/userActive.png",
						path: "/pages/user/user",
						midButton: false
					}
				],
				isNews: false
			};
		},
		props: {
			active: {
				default: 0,
				type: [String, Number]
			}
		},
		methods: {
			tabClick(item, index) {
				uni.switchTab({
					url: item.path
				});
			},
		},
		computed: {
			tabText() {
				return data => {
					if (data === "heart") {
						return this.$t("tabBar.heart");
					} else if (data === "news") {
						return this.$t("tabBar.news");
					} else if (data === "user") {
						return this.$t("tabBar.user");
					}
				};
			},
			...mapGetters(["totalUnreadCount"]),
		},
	};
</script>

<style lang="scss">
	.m-tabBar {
		position: fixed;
		right: 0;
		left: 0;
		bottom: 0;
		background-color: #fff;
		z-index: 2048;
		border-radius: 24rpx 24rpx 0 0;
		box-shadow: 0rpx 0rpx 40rpx #ced6de;
		border-bottom: constant(safe-area-inset-bottom) solid #fff;
		border-bottom: env(safe-area-inset-bottom) solid #fff;

		&.isAndroidBox {
			// border-bottom: 12rpx solid #fff;
		}

		.tab {
			width: 25%;
			height: 88rpx;
			flex-direction: column;

			&.isAndroid {
				&.active {
					.icon {
						bottom: 40rpx;
					}
				}

				height: 120rpx;

				.icon {
					bottom: 60rpx;
				}

				.text {
					bottom: 30rpx;
				}
			}

			&.active {
				.text {
					font-family: PingFangSCBold;
					color: #000;
				}

				.icon {
					width: 125rpx;
					height: 125rpx;
					bottom: 10rpx;

					.spot {
						color: #fff;
						top: 30rpx;
						right: 30rpx;
					}
				}
			}

			.icon {
				width: 48rpx;
				height: 48rpx;
				border-radius: 10rpx;
				position: absolute;
				bottom: 30rpx;

				.spot {
					position: absolute;
					z-index: 100;
					color: $pink;
					right: -10rpx;
					top: 0;
				}
				.badge{
					position: absolute;
					z-index: 100;
					left: 30rpx;
					top: -6rpx;
					min-width: 35rpx;
					padding: 0 8rpx;
					height: 35rpx;
					border-radius: 40rpx;
					background-color: $pink;
					overflow: hidden;
					color: #fff;
				}
			}

			.text {
				font-size: 20rpx;
				color: #6B7582;
				font-family: PingFangSCMedium;
				position: absolute;
				line-height: 1;
				bottom: 0;
			}
		}
	}
</style>
