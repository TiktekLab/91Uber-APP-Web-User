<template>
	<view class="bodyMain">
		<u-navbar title="系统公告" />
		<view class="main">
			<text class="title flex-start">{{ noticeDetails.title }}</text>
			<text class="time flex-start">{{ formatTime(noticeDetails.createTime) }}</text>
			<u-parse :content="noticeDetails.description" @preview="preview" @navigate="navigate" />
		</view>
	</view>
</template>

<script>
import { openLink } from "@/common/js/common.js";	
import uParse from "@/components/gaoyia-parse/parse.vue";
import moment from "moment";
export default {
	components: {
		"u-parse": uParse
	},
	data() {
		return {
			noticeDetails: {
				createTime: undefined,
				title: undefined,
				description: undefined
			}
		};
	},
	onLoad() {
		const that = this;
		const eventChannel = this.getOpenerEventChannel();
		eventChannel.on("acceptDataFromOpenerPage", function(data) {
			that.noticeDetails = data;
		});
	},
	methods: {
		preview(src, e) {
			openLink(src);
		},
		navigate(href, e) {
			openLink(href);
		}
	},
	computed: {
		formatTime() {
			return time => {
				if (time) {
					return moment(time.replace("T", " ")).format("DD/MM/YYYY");
				}
			};
		}
	}
};
</script>

<style lang="scss" scoped>
.main {
	padding: 30rpx;
	overflow: auto;
	.title {
		font-size: 42rpx;
		font-family: PingFangSCBold;
	}
	.time {
		color: #6b7582;
		margin: 20rpx 0;
	}
}
</style>
