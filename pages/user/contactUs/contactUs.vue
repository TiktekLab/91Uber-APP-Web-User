<template>
	<view class="bodyMain">
		<u-navbar title="联系我们" />
		<view class="contactUs " v-for="(item, index) in platformContactList" :key="index">
			<view class="contactItem " v-if="item.type === 0">
				<text class="title">添加平台客服</text>
				<view class="content m-radius">
					<text class="textColor">{{ item.name }}账号: {{ item.account }}</text>
				</view>
				<view class="flex-end"><u-button hover-class="none" plain class="copyBtn m-btn" @click="confirmCopy(item.account)">复制</u-button></view>
			</view>
			<view class="contactItem " v-else>
				<text class="title">添加交流群</text>
				<view class="content m-radius">
					<text class="textColor">{{ item.name }}账号: {{ item.account }}</text>
				</view>
				<view class="flex-end"><u-button hover-class="none" plain class="copyBtn m-btn" @click="confirmCopy(item.account)">复制</u-button></view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	onLoad() {
		this.getPlatformContactList();
	},
	data() {
		return {
			platformContactList: []
		};
	},
	methods: {
		getPlatformContactList() {
			// 联系我们
			this.$http.get(this.$api.platformContactList).then(res => {
				this.platformContactList = res.list;
			});
		},
		confirmCopy(content) {
			uni.setClipboardData({
				data: content, //要被复制的内容
				success: () => {
					//复制成功的回调函数
					uni.showToast({
						//提示
						title: "复制成功"
					});
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped src="../css/contactUs.scss"></style>
