<template>
	<view class="bodyMain ">
		<u-navbar :is-back="false" title="消息" :border-bottom="false" />
		<!-- 顶部的导航 -->
		<u-tabs :list="tabList" height="100" class="tabs" :is-scroll="false" :current="currenTab" bar-width="100"
			active-color="#000000" @change="changeTab" />
		<view :class="['listBox',{isAndroid: isAndroid}]">
			<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getData" :up="upOption">
				<uni-swipe-action>
					<uni-swipe-action-item v-if="currenTab === 0 " :right-options="swipeAction"
						@click="deleteFunc($event, index)" v-for="(item, index) in messageList" :key="'order' + index">
						<newItem :showType="currenTab" :ItemEvent="ItemEvent" :ItemDetails="item" :itemIndex="index" />
					</uni-swipe-action-item>
					<uni-swipe-action-item v-if="currenTab ===  1" :right-options="swipeAction"
						@click="deleteFunc($event, index)" v-for="(item, index) in messageList" :key="'follow' + index">
						<newItem :showType="currenTab" :ItemEvent="ItemEvent" :ItemDetails="item" :itemIndex="index" />
					</uni-swipe-action-item>
					<uni-swipe-action-item v-if="currenTab === 2" :right-options="swipeAction"
						@click="deleteFunc($event, index)" v-for="(item, index) in messageList" :key="'Notice' + index">
						<SystemItem :ItemEvent="noticeInfo" :ItemDetails="item" :itemIndex="index" />
					</uni-swipe-action-item>
				</uni-swipe-action>
			</mescroll-body>
		</view>
		<!-- 弹窗信息 -->
		<u-modal v-model="isShowModal" :content="modalOptions.content" :title="modalOptions.title"
			:confirm-text="modalOptions.confirmText" show-cancel-button :cancel-text="modalOptions.cancelText"
			@confirm="confirmFunc"></u-modal>
		<!-- 自定义tabBar -->
		<tabBar :active="2" />
	</view>
</template>

<script>
	import { mapState } from "vuex";
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
	import tabBar from "@/component/tabBar/tabBar.vue";
	import newItem from "@/component/newItem/newItem.vue";
	import SystemItem from "@/component/SystemItem/SystemItem.vue";
	import { getLocalFollowList, getLocalNoticeList, readLocalFollow, readLocalNotice, deleteLocalNotice, deleteLocalFollow } from "@/common/js/localDatabase.js";
	import { updateNotificationUnreadCount, updateFollowUnreadCount, updateNoticeUnreadCount } from "@/common/js/storeCommon.js";
	export default {
		mixins: [MescrollMixin],
		components: {
			tabBar,
			newItem,
			SystemItem
		},
		data() {
			return {
				currenTab: 1,
				tabList: [{
						name: "订单提醒",
						count: "0"
					},
					{
						name: "我的关注",
						count: "0"
					},
					{
						name: "系统公告",
						count: "0"
					}
				],
				isShowModal: false, // 是否显示提醒弹框
				modalOptions: { //弹框
					title: '迟到申请',
					content: '迟到申请通过后可最多推迟开始时间半小时，未通过申请，迟到15分钟订单将自动取消',
					confirmText: '确认申请',
					cancelText: '取消',
				},
				callOptions: { //操作类型
					optionType: undefined,
					itemIndex: undefined,
				},
				swipeAction: [{
					text: "删除",
					style: {
						backgroundColor: "#FC4850"
					}
				}],
				upOption: {
					textNoMore: "-- 没有更多数据 --",
					noMoreSize: 0,
					toTop: {
						bottom: 200
					}
				},
				messageList: [], //消息列表数据
				freshUnReadCount: false, //是否更新未读消息数量
			};
		},
		onLoad() {
			uni.hideTabBar();
			if (this.notificationUnreadCount > 0) {
				this.currenTab = 0;
			} else if (this.followUnreadCount > 0) {
				this.currenTab = 1;
			} else if (this.noticeUnreadCount > 0) {
				this.currenTab = 2;
			}
			this.updateUnReadBadge();
		},
		onReady() {
			uni.$on("updateMessage", data => {
				this.onUpdateMessage(data);
			});			
		},
		computed: {
			...mapState({
				notificationUnreadCount: state => state.notificationUnreadCount,
				followUnreadCount: state => state.followUnreadCount,
				noticeUnreadCount: state => state.noticeUnreadCount,
			})
		},
		watch: {
			notificationUnreadCount() {
				this.tabList[0].count = this.notificationUnreadCount;
			},
			followUnreadCount() {
				this.tabList[1].count = this.followUnreadCount;
			},
			noticeUnreadCount() {
				this.tabList[2].count = this.noticeUnreadCount;
			}
		},
		methods: {
			//监听页面更新
			onUpdateMessage(data) {
				switch (data.noticeType) {
					case 2:
						this.currenTab = 0;
						break;
					case 3:
						this.currenTab = 1;
						break;
					case 4:
						this.currenTab = 2;
						break;
				}
				this.messageList = [];
				this.freshUnReadCount = data.reset;
				this.mescroll.resetUpScroll();
			},
			downCallback() {
				// 下拉加载刷新上拉加载
				this.freshUnReadCount = true;
				this.mescroll.resetUpScroll();
			},
			getData(page) {
				if (this.currenTab === 0) {
					//查询订单提醒列表
					this.$http.get(this.$api.notificationsList, {
						pageNum: page.num,
						pageSize: page.size
					}).then(res => {
						if (page.num == 1) this.messageList = [];
						this.messageList = this.messageList.concat(res.list);
						//console.log('消息列表：',this.messageList);
						this.mescroll.endBySize(res.list.length, res.count);
						if (this.freshUnReadCount) updateNotificationUnreadCount();
					}).catch(err => {
						this.mescroll.endErr();
					})
				} else if (this.currenTab === 1) {
					//查询关注提醒
					getLocalFollowList(page.num, page.size).then(res => {
						if (page.num == 1) this.messageList = [];
						this.messageList = this.messageList.concat(res.list);
						this.mescroll.endBySize(res.list.length, res.count);
						if (this.freshUnReadCount) updateFollowUnreadCount();
					}).catch(err => {
						this.mescroll.endErr();
					})
				} else {
					//查询公告
					getLocalNoticeList(page.num, page.size).then(res => {
						if (page.num == 1) this.messageList = [];
						this.messageList = this.messageList.concat(res.list);
						//console.log('公告列表：',this.messageList);
						this.mescroll.endBySize(res.list.length, res.count);
						if (this.freshUnReadCount) updateNoticeUnreadCount();
					}).catch(err => {
						this.mescroll.endErr();
					})
				}
			},
			changeTab(e) {
				// 切换tabs
				this.currenTab = e;
				this.messageList = [];
				this.freshUnReadCount = true;		
				this.mescroll.resetUpScroll();
			},
			ItemEvent(e, index, associateId, employeeId) {
				this.callOptions.optionType = e;
				this.callOptions.itemIndex = index;
				const msg = this.messageList[index];
				//0.迟到申请，1.我已到达，2.前往评价，3.员工已到达，100:查看详情
				if (e === 0) {
					this.isShowModal = true;
				} else if (e === 1) {
					this.orderArrivals();
				} else if (e === 2) {
					this.isReadNotification(msg);
					uni.navigateTo({
						url: `../heart/evaluate/evaluate?orderId=${associateId}&staffId=${employeeId}`
					})
				} else if (e === 3) {
					this.orderBegin();
				} else if (e === 100) {
					if (this.currenTab === 0) {
						this.isReadNotification(msg);
						uni.navigateTo({
							url: `../heart/orderDetails/orderDetails?orderId=${associateId}`
						})
					} else if (this.currenTab === 1) {
						this.readFollowSingle(index);
						uni.navigateTo({
							url: `../heart/userDetails/userDetails?id=${employeeId}`
						})
					}
				}
			},
			deleteFunc(e, index) { //删除
				this.callOptions.itemIndex = index;
				if (this.currenTab === 0) {
					this.deleteNotification();
				} else if (this.currenTab === 1) {
					deleteLocalFollow(this.messageList[index].uId).then(res => {
						this.messageList.splice(index, 1);
						updateFollowUnreadCount();
					})
				} else {
					deleteLocalNotice(this.messageList[index].uId).then(res => {
						this.messageList.splice(index, 1);
						updateNoticeUnreadCount();
					})
				}
			},
			navigateTo(url) {
				uni.navigateTo({
					url: url
				});
			},
			confirmFunc() {
				if (this.callOptions.optionType === 0) { //迟到申请
					this.orderPutOff();					
				}
			},
			noticeInfo(data, index) {
				this.callOptions.itemIndex = index;				
				if (data.isRead === 0) {
					readLocalNotice(data.uId).then(res => {
						this.messageList[index].isRead = 1;
						updateNoticeUnreadCount();
					})
				}
				uni.navigateTo({
					url: "./noticeInfo/noticeInfo",
					success(res) {
						res.eventChannel.emit("acceptDataFromOpenerPage", data);
					}
				});
			},
			//我已到达
			orderArrivals() {
				const msg = this.messageList[this.callOptions.itemIndex];
				this.$http.post(this.$api.customerArrivals(msg.associateId)).then(res => {
						msg.status = 2;
						this.isReadNotification(msg);
					})
			},
			//员工已到达，开始服务
			orderBegin(){
				const msg = this.messageList[this.callOptions.itemIndex];
				this.$http.post(this.$api.orderBegin(msg.associateId)).then(res => {
						msg.status = 2;
						this.isReadNotification(msg);						
						this.mescroll.resetUpScroll();
					})				
			},
			//迟到申请
			orderPutOff() {
				const msg = this.messageList[this.callOptions.itemIndex];
				this.$http.post(this.$api.customerPutOff(msg.associateId)).then(res => {
						this.isReadNotification(msg);
						msg.putOffStatus = -1
					})
			},
			//消息是否已读
			isReadNotification(obj) {
				if (!obj.isRead) {
					this.readNotification(this.callOptions.itemIndex)
				}
			},
			readNotification(index) {
				const message = this.messageList[index];
				this.$http.post(this.$api.notificationRead(message.id)).then(res => {
					updateNotificationUnreadCount();
					message.isRead = true;
				})
			},
			deleteNotification() {
				const message = this.messageList[this.callOptions.itemIndex];
				return this.$http.delete(this.$api.deleteNotification(message.id)).then(res => {
					updateNotificationUnreadCount();
					this.messageList.splice(this.callOptions.itemIndex, 1);
				})
			},
			//更新tabs badge数量
			updateUnReadBadge() {
				this.tabList[0].count = this.notificationUnreadCount;
				this.tabList[1].count = this.followUnreadCount;
				this.tabList[2].count = this.noticeUnreadCount;
			},
			batchReadNotification() {
				const unReadList = this.messageList.filter(item => !item.isRead);
				if (unReadList.length > 0) {
					const ids = unReadList.map(item => {
						return item.id
					})
					this.$http.post(this.$api.batchNotificationRead, {
						ids
					}).then(res => {
						updateNotificationUnreadCount();
						unReadList.map(item => {
							item.isRead = true;
						})
					})
				}
			},
			readFollow() {
				const unReadList = this.messageList.filter(item => item.isRead === 0);
				if (unReadList.length > 0) {
					const ids = unReadList.map(item => {
						return item.uId
					})
					readLocalFollow(ids).then(res => {
						updateFollowUnreadCount();
						unReadList.map(item => {
							item.isRead = 1;
						})
					})
				}
			},
			readFollowSingle(index) {
				const message = this.messageList[index];
				if (message.isRead === 0) {
					readLocalFollow([message.uId]).then(res => {
						updateFollowUnreadCount();
						message.isRead = 1;
					})
				}
			},
		},
		onUnload() {
			uni.$off("updateMessage");
		}
	};
</script>

<style lang="scss" scoped src="./css/news.scss"></style>
