<template>
	<view class="bodyMain">
		<view class="userInfo">
			<view class="bodyBG"></view>
			<view class="user">
				<view class="avatar flex-center" @click="navigateTo">
					<image class="m-icon" :src="bindInfo.avatar||defaultAvatar" mode="aspectFill"></image>
				</view>
				<view class="info flex-center padding">
					<text class="num">{{ bindInfo.code ? '编号：'+bindInfo.code : '' }}</text>
					<text class="name">{{bindInfo.name}}</text>
					<view class="flex-center">
						<text>评分: {{bindInfo.score||'无'}}</text>
						<text class="iconfont icon">&#xe642;</text>
					</view>
				</view>
			</view>
		</view>
		<view class="comment">
			<view class="flex-start">
				<text class="title">收到的评价</text>
			</view>
			<view class="commentList flex-start">
				<view class="item flex-center" v-for="(item,index) in evaluationList" :key="index">
					<text class="count">{{item.number}}</text>
					<text class="text">{{item.content}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userData: false, // 用户类型true:员工，false:客户/用户
				staffInfo: {}, //员工信息
				memberInfo: {}, //用户信息				
				evaluationList: [], //评价标签列表
				defaultAvatar: require("@/static/icon/tba.png"),
			};
		},
		onLoad(option) {
			this.userData = decodeURIComponent(option.userData) === 'true';
			if (this.userData) {
				this.getStaffInfo(option.id);
				//查询评价标签列表merchandiseId:客户或员工id,type:1.客户，2.员工	
				this.getEvaluationLabels(option.id, 2);
			} else {
				this.getMemberInfo(option.id);
				this.getEvaluationLabels(option.id, 1);
			}
		},
		computed: {
			bindInfo() {
				if (this.userData) {
					let {
						avatar,
						username,
						score,
						serialNumber
					} = this.staffInfo;
					return {
						avatar: avatar,
						name: username,
						score: score,
						code: serialNumber
					};
				} else {
					let {
						avatar,
						nickName,
						score
					} = this.memberInfo;
					return {
						avatar: avatar,
						name: nickName,
						score: score,
						code: undefined
					};
				}
			}
		},
		methods: {
			getStaffInfo(employeeId) { //查询员工信息
				this.$http.get(this.$api.staffInfo + employeeId).then(res => {
					this.staffInfo = res.employee;
				})
			},
			getMemberInfo(memberId) { //查询用户信息
				this.$http.get(this.$api.memberInfo, {
					memberId
				}).then(res => {
					this.memberInfo = res.memberSimpleVO;
				})
			},
			getEvaluationLabels(merchandiseId, type) {
				this.$http.get(this.$api.evaluationStatistics + merchandiseId + '/' + type).then(res => {
					this.evaluationList = res.list;
				})
			},
			navigateTo() {
				if (this.userData) {
					uni.navigateTo({
						url: '../userDetails/userDetails?id=' + this.staffInfo.id
					})
				}
			}
		}
	};
</script>

<style lang="scss" scoped src="../css/details.scss"></style>
