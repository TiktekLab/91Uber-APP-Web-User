<template>
	<view class="bodyMain">
		<u-navbar title="我的关注" />
		<view class="main">
			<mescroll-body offset="300" ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getData"
				:up="upOption">
				<view class="itemList flex-space-between padding" v-for="(item, index) in attentionList" :key="index">
					<view class="left flex-start">
						<view class="avatar flex-center" @click="navigateTo(item)">
							<image class="m-icon" :src="item.avatar" mode="aspectFill"></image>
						</view>
						<text class="flex-center userName">{{item.username}}</text>
					</view>
					<view class="right" @click="showModal($event, index)"><text class="btn flex-center">关注中</text>
					</view>
				</view>
			</mescroll-body>
		</view>
		<!-- 是否取消关注 -->
		<u-modal v-model="isShowModal" title="确认取消关注？" @confirm="noAttention" show-cancel-button confirm-color="#f1598e"
			:content="`取消关注后不再接收 ${staffName} 的动态信息`"></u-modal>
	</view>
</template>

<script>
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
	export default {
		mixins: [MescrollMixin],
		data() {
			return {
				upOption: {
					textNoMore: '-- 没有更多数据 --',
					noMoreSize: 0
				},
				attentionList: [], //关注员工列表
				isShowModal: false,
				staffName: undefined,
				deleteIndex: undefined,
			};
		},
		onLoad() {},
		methods: {
			// 下拉加载刷新上拉加载
			downCallback() {
				this.mescroll.resetUpScroll();
			},
			getData(page) { //查询关注的员工		
				this.$http.get(this.$api.followsStaffList, {
					pageNum: page.num,
					pageSize: page.size
				}).then(res => {
					if (page.num == 1) this.attentionList = [];
					this.attentionList = this.attentionList.concat(res.list);
					this.mescroll.endBySize(res.list.length, res.count);

				}).catch(err => {
					this.mescroll.endErr();
				})
			},
			navigateTo(item) {
				console.log('关注数据：', item);
				uni.navigateTo({
					url: '../../heart/userDetails/userDetails?id=' + item.id
				})
			},
			showModal(e, index) {
				this.staffName = this.attentionList[index].username;
				this.isShowModal = true;
				this.deleteIndex = index;
			},
			noAttention() { // 取消关注员工				
				this.$http.delete(this.$api.unFollowStaff(this.attentionList[this.deleteIndex].id)).then(res => {
					this.attentionList.splice(this.deleteIndex, 1);
					uni.showToast({
						title: '已取消关注',
						icon: 'none'
					})
				})
			}
		}
	};
</script>

<style lang="scss" scoped src="../css/myAttention.scss"></style>
