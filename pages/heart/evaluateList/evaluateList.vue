<template>
	<view class="bodyMain hideScroll">
		<u-navbar title="评价" :border-bottom="false" />
		<view class="evaluateList padding">
			<view class="title flex-start">
				<text class="iconfont stars">&#xe642;</text>
				<text class="text">{{ score | scoreFormat() }} · {{ evaluationCount }} 评价</text>
			</view>
		<!-- 	<view class="evaluateItem flex">
				<text class="flex-center item" v-for="(item, index) in evaluationLabel" :key="index">{{ item.content }}</text>
			</view> -->
			<view class="listBox">
				<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getData" :up="upOption">
					<view class="listItem" v-for="(item, index) in evaluationList" :key="index">
						<view class="userInfo flex-start">
							<view class="left">
								<u-image width="82" height="82" v-if="item.photo" shape="circle" :src="item.photo" mode="aspectFill" />
								<text class="iconfont icon flex-center" v-else>&#xe610;</text>
								</view>
							<view class="right">
								<view class="top flex-space-between">
									<text class="name">{{ item.username }}</text>
									<u-rate v-model="item.score" disabled inactive-color="#FFD60A" active-color="#FFD60A" />
								</view>
								<text class="time">{{ formatTime(item.createTime) }}</text>
							</view>
						</view>
						<text class="centent">{{ item.content }}</text>
					</view>
				</mescroll-body>
			</view>
		</view>
	</view>
</template>

<script>
import moment from "moment";
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
export default {
	mixins: [MescrollMixin],
	data() {
		return {
			rate: 4, // 评分星星数量
			staffId: null,
			score: null,
			evaluationCount: undefined,
			evaluationLabel: undefined,
			evaluationList: undefined,
			upOption: {
				textNoMore: "-- 没有更多数据 --",
				noMoreSize: 0,
				toTop: {
					bottom: 200
				}
			}
		};
	},
	onLoad(option) {
		uni.hideTabBar();
		this.staffId = option.staffId;
		this.score = option.score;
		this.evaluationCount = option.evaluationCount;
		// this.getLabel();
	},
	methods: {
		downCallback() {
			// 下拉加载刷新上拉加载
			this.mescroll.resetUpScroll();
		},
		getLabel() {
			this.$http.get(this.$api.evaluationStatistics + this.staffId + "/2").then(res => {
					this.evaluationLabel = res.list;
				}).catch(err => {
					this.mescroll.endErr();
				});
		},
		getData(page) {
			let param = {
				pageNum: page.num,
				pageSize: page.size,
				type: 2
			};
			this.$http.get(this.$api.evaluationList(this.staffId), param).then(res => {
					if (page.num == 1) this.evaluationList = [];
					this.evaluationList = this.evaluationList.concat(res.list);
					//console.log('*****评论列表*****：',res.list);
					this.mescroll.endBySize(res.list.length, res.count);
				}).catch(err => {
					this.mescroll.endErr();
				});
		},
		formatTime(time) {
			if (time) return moment(time.replace("T", " ")).format("DD MMM YYYY");
			return "";
		}
	}
};
</script>

<style lang="scss" scoped src="../css/evaluateList.scss"></style>
