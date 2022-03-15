<template>
</template>
<script>
	let wvAddress;
	export default {
		data() {
			return {}
		},
		onLoad(option) {
			let viewUrl = "/hybrid/html/staffaddress.html?index=" + option.index + "&googleKey=" + option.googleKey
			if (option.address) {
				viewUrl += "&address=" + option.address
			}
			wvAddress = plus.webview.create("", "staff-address", {
				'uni-app': 'none',
				top: uni.getSystemInfoSync().statusBarHeight + 44
			})
			wvAddress.loadURL(viewUrl);
			const currentWebview = this.$scope.$getAppWebview();
			currentWebview.append(wvAddress);
		},
		onBackPress(e) {
			if (wvAddress) {
				wvAddress.clear()
				wvAddress.close()
			}
		},
		methods: {

		}
	}
</script>
<style>
</style>
