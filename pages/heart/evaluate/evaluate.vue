<template>
	<view class="bodyMain">
		<u-navbar title="评价商家" />
		<staffDetails :staffDetails="staffInfo" />
		<view class="evaluate padding">
			<view class="flex-space-between">
				<text class="pageTitle">请为此次服务评分*</text>
				<u-rate v-model="rateVal" size="36" @change="rate" active-color="#FFD60A" inactive-color="#FFD60A" />
			</view>
			<view class="evaluateList">
				<!-- <text class="pageTitle">请为您的体验留下评价（可多选）</text> -->
				<text class="pageTitle">请为您的体验留下最真实的评价</text>
				<!-- <view class="itemContent flex">
					<view :class="['tag', 'flex-center', { active: item.checked }]" v-for="(item, index) in evaluateList" :key="index" @click="tabClick(item)">
						<text class="flex-center m-radius">{{ item.content }}</text>
					</view>
				</view> -->
				<view class="flex-center textareaBox  m-radius">
					<textarea v-model="evaluateVal" class="textarea"  placeholder="请在此输入..." maxlength="-1" />
				</view>
			</view>
		</view>
		<view  :class="['footerBtn flex-end padding ',{isAndroid: isAndroid}]"><u-button hover-class="none" plain class="btn  pink m-btn" @click="Submit">提交评价</u-button></view>
		<u-modal v-model="isShowModal" content="您的评价已提交，欢迎继续使用91Uber" title="谢谢您的评价" confirm-text="返回" @confirm="Confirm"></u-modal>
	</view>
</template>

<script>
import staffDetails from '@/component/staffDetails/staffDetails.vue';
export default {
	components: {
		staffDetails
	},
	data() {
		return {
			rateVal: undefined, // 评分
			evaluateVal: undefined, // 评价内容
			isShowModal: false, // 是否显示提醒弹框
			evaluateList: [],
			staffInfo: {},
		};
	},
	onLoad(option) {
		this.orderId = decodeURIComponent(option.orderId);
		this.evaluationLabelsList();
		this.employeeSimple(option.staffId);
	},
	methods: {
		employeeSimple(staffId) {
			this.$http.get(this.$api.employeeSimple(staffId)).then(res => {
					this.staffInfo = res.employee
			})
		},
		tabClick(item) {
			this.$set(item, 'checked', !item.checked);
		},
		Submit() {
			// let labelIds = this.evaluateList.filter(e => e.checked).map(e => e.id)
			const param = {
				orderId: this.orderId,
				content: this.evaluateVal,
				score: this.rateVal,
				// evaluationLabelIds: labelIds
			}

			this.$http.post(this.$api.orderScoreByCustomer, param).then(res => {
				this.isShowModal = !this.isShowModal;
				uni.$emit("updateMessage", {
					reset: true,
					noticeType: 2
				});
			})
		
		},
		rate(e) {
			this.rateVal = e
		},
		evaluationLabelsList() {
			this.$http.get(this.$api.evaluationLabelsList, {type: 1}).then(res => {
					this.evaluateList = res.list
				})
		},
		Confirm() {
			uni.navigateBack({
				delta: 4
			});
			
			// uni.navigateTo({
			// 	url: '../userDetails/userDetails'
			// });
			
		}
	}
};
</script>

<style lang="scss" scoped src="../css/evaluate.scss"></style>
