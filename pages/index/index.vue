<template>
	<view class="bodyMain">
		<view class="main flex-space-between">
			<view class="top w100"><image class="m-icon" src="/static/image/index.png" mode="aspectFill"></image></view>
			<view class="bottom w100 flex-space-between">
				<view class="width100">
					<text class="title ">
						随时随地
						<br />
						想约就约
					</text>
					<u-button hover-class="none" @click="navigateTo('register')" plain class="regBtn   pink  m-btn">注册</u-button>
					<u-button hover-class="none" @click="navigateTo('login')" plain class="regBtn plain  pink  m-btn">已有账户? 现在登录</u-button>
				</view>
				<view  :class="['footer width100 flex-space-around', { isAndroid: isAndroid }]">
					<text>所有解释权归91uber所有</text>
					<text>© 2021 91Uber</text>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	onShow() {
	},
	methods: {
		navigateTo(e) {
			uni.navigateTo({
				url: "../login/" + e
			});
		}
	}
};
</script>
<style lang="scss" scoped src="./index.scss"></style>
