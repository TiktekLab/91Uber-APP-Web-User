<template>
	<view>
		<web-view :src="linkUrl"></web-view>		
	</view>
</template>
<script>
	export default {
		data() {
			return {
				linkUrl:''				
			}
		},
		onLoad(option) {
			this.linkUrl = option.openLink;
		}
	}
</script>
<style>
</style>
