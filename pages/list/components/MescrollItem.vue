<template>
	<mescroll-uni :class="['MescrollItem', { isAndroid: isAndroid }]" :ref="'mescrollRef' + currentTabs"
		@init="mescrollInit" @down="downCallback" @up="getData" :up="upOption">
		<staffPanel :class="{ margin: index === staffList.length - 1 }" :follow="follow" :unFollow="unFollow" :followIds="followIds" v-for="(item, index) in staffList" :key="index" :staffData="item" />
	</mescroll-uni>
</template>

<script>
	import { mapState } from "vuex";
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
	import staffPanel from "./staffPanel.vue";
	import { followStaff, unFollowStaff } from "@/common/js/apiCommon.js";
	export default {
		mixins: [MescrollMixin],
		components: {
			staffPanel
		},
		props: {
			height: [Number, String], // mescroll的高度
			currentTabs: [Number],
			followIds :{
				type: Array,
				default() {
					return [];
				}
			}			
		},
		data() {
			return {
				staffList: [],
				upOption: {
					textNoMore: "-- 没有更多数据 --",
					noMoreSize: 0,
					toTop: {
						bottom: 200
					}
				}
			};
		},
		mounted() {			
			uni.$on("autoUpdateByPushMsg", () => {
				this.downCallback();			
			})
		},
		watch:{
			'followIds.length':{
				handler(newValue, oldValue){
					if(this.currentTabs === 3) this.downCallback();	
				}
			}
		},
		computed:{
			...mapState({
				currentLocation: state => state.currentLocation
			})		
		},
		methods: {
			downCallback() {
				this.mescroll.resetUpScroll();
			},
			getData(page) {
				let params = {
					pageNum: page.num,
					pageSize: page.size
				};				
				//除官方推荐外，其他显示的女生要跟客户同一州
				if(this.currentTabs !== 0 && this.currentLocation && this.currentLocation.province) {
					params.province = this.currentLocation.province;
				}
				if (this.currentTabs === 0) {
					//官方推荐
					params.isRecommend = true;
					params.isPositiveOrder = true;
				} else if (this.currentTabs === 1) {
					//最新上线
				} else if (this.currentTabs === 2) {
					//最佳评分，4.5分以下不显示
					params.minScore = 4.5;
					params.orderMode = 2;
				} else if (this.currentTabs === 3) {
					//我的关注
					const pageIds = this.getPageFollowIds(params.pageNum, params.pageSize);
					params.ids = pageIds;
					if (params.ids.length === 0) {
						if (params.pageNum === 1) this.staffList = [];
						this.mescroll.endBySize(params.ids.length, this.followIds.length);
						return;
					}
					params.pageNum = 1;
				}
				this.$http.get(this.$api.staffList, params).then(res => {
						if (page.num == 1) this.staffList = [];
						this.staffList = this.staffList.concat(res.list);
						//console.log('列表数据：',res.list);
						this.mescroll.endBySize(res.list.length, res.count);
					}).catch(err => {
						this.mescroll.endErr();
				});
			},
			getPageFollowIds(pageNum, pageSize) {
				// 关注
				let total = this.followIds.length;
				let start = (pageNum - 1) * pageSize;
				let end = pageNum * pageSize;
				if (start >= total) return [];
				if (end >= total) return this.followIds.slice(start);
				return this.followIds.slice(start, end);
			},
			follow(e) {
				// 关注
				followStaff(e.storeId, e.id).then(res => {
					this.$emit("updateFlowList");
					uni.showToast({
						title: "关注成功"
					});
				});
			},
			unFollow(e) {
				// 取消关注
				unFollowStaff(e.id).then(res => {
					this.$emit("updateFlowList");
					uni.showToast({
						title: "已取消关注"
					});		
				});
			}
		},
		destroyed() {
			uni.$off("autoUpdateByPushMsg");			
		}
	};
</script>

<style lang="scss" scoped>
	.MescrollItem {
		margin-bottom: 50rpx;

		&.isAndroid {
			margin-bottom: 20rpx;
		}

		.margin {
			margin-bottom: 0;
		}
	}
</style>
