<template>
	<view class="bodyMain hideScroll">
		<u-navbar title="个人信息" :border-bottom="false" />
		<view class="userItem padding">
			<view class="item flex-space-between " @click="selectAvatar">
				<text class="left itemName">修改头像</text>
				<u-image width="120" height="120" shape="circle" v-if="loginUserInfo.avatar" :src="loginUserInfo.avatar" mode="aspectFill" />
				<view class="avatar flex-center" v-else><text class="iconfont icon flex-center">&#xe610;</text></view>
			</view>
			<view class="item flex-space-between " @click="ShowModal(1)">
				<text class="left itemName">修改昵称</text>
				<text class="left itemName">{{ loginUserInfo.nickName }}</text>
			</view>
			<view class="item flex-space-between ">
				<text class="left itemName">手机号（不可修改）</text>
				<text class="left disable itemName">{{ formatPhone(loginUserInfo.boundPhone) }}</text>
			</view>
			<view class="item flex-space-between " @click="ShowModal(2)">
				<text class="left itemName">修改邮箱</text>
				<text class="left itemName">{{ loginUserInfo.email || "绑定邮箱" }}</text>
			</view>
			<view class="item flex-space-between " @click="navigateTo">
				<text class="left itemName">修改密码</text>
				<text class="left itemName">******</text>
			</view>
			<view class="item flex-space-between " @click="ShowModal(3)">
				<text class="left itemName">退出登录</text>
				<u-icon name="arrow-right" color="#C7C7CC" />
			</view>
		</view>
		<u-modal v-model="isShowModal" show-cancel-button @cancel="ShowModal(false)" @confirm="modalConfirm" :title="modalTitle" :centent="modalCentent">
			<view v-if="modalType === 1" class="slot-content ">
				<text class="flex-center">请输入您的新昵称</text>
				<input v-model="modalData.nickName" class="input padding border" placeholder="请输入您的新昵称" />
			</view>
			<view v-if="modalType === 2" class="slot-content ">
				<text class="flex-center">请输入您的新邮箱</text>
				<input v-model="modalData.email" class="input padding border" placeholder="请输入您的新邮箱" />
			</view>
			<view v-if="modalType === 3" class="slot-content "><text class="flex-center">确定要退出此账号吗？</text></view>
		</u-modal>
	</view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { uploadFile } from "@/common/js/filerequest.js";
import { updateSetLoginUserInfo } from "@/common/js/storeCommon.js";
import { WebSocketExit } from "@/common/js/webSocketPush.js";
export default {
	onLoad() {
		this.modalData = Object.assign({}, this.loginUserInfo);
	},
	data() {
		return {
			modalData: {},
			isShowModal: false, // 是否显示modal
			modalType: null,
			modalTitle: undefined, // 弹框标题，
			modalCentent: undefined // 弹框内容
		};
	},
	methods: {
		...mapMutations(["emptyUserInfo"]),
		selectAvatar() {
			const that = this;
			// 选择本地头像
			uni.chooseImage({
				count: 1,
				success: e => {
					uploadFile({
						url: this.$api.imgUpload,
						filePath: e.tempFilePaths[0],
						name: "file",
						formData: {
							folderPath: "danners"
						},
						loading: true,
						success: res => {
							this.editUserInfo({ avatar: "https://" + res.result });
						},
						fail: err => {
							this.$u.toast("头像修改失败");
						}
					});
				}
			});
		},
		ShowModal(e) {
			this.isShowModal = !this.isShowModal;
			this.modalTitle = undefined;
			this.modalCentent = undefined;
			if (e) {
				this.isModalType(e);
			}
		},
		isModalType(e) {
			this.modalType = Number(e);
			switch (e) {
				case 1:
					this.modalTitle = "修改昵称";
					break;
				case 2:
					this.modalTitle = "修改邮箱";
					break;
				case 3:
					this.modalTitle = "退出登录";
					break;
			}
		},
		modalConfirm() {
			// 弹框确认
			switch (this.modalType) {
				case 1:
					this.editNickName();
					break;
				case 2:
					this.editEmail();
					break;
				case 3:
					this.LogOut();
					break;
			}
		},
		editNickName() {
			if (this.modalData.nickName === "" || this.modalData.nickName === undefined) {
				this.$u.toast("昵称不能为空");
			} else if (this.modalData.nickName.length > 20) {
				this.$u.toast("昵称格式不规范");
			} else {
				this.editUserInfo({ nickName: this.modalData.nickName });
			}
			this.modalData.nickName = this.loginUserInfo.nickName;
		},
		editEmail() {
			if (this.modalData.email === "" || this.modalData.email === undefined) {
				this.$u.toast("邮箱不能为空");
			} else if (!this.$base.mailRegular.test(this.modalData.email)) {
				this.$u.toast("邮箱格式不规范");
			} else {
				this.editUserInfo({ email: this.modalData.email });
			}
			this.modalData.email = this.loginUserInfo.email;
		},
		LogOut() {
			// 退出登录
			if (this.userInfo.access_token) {
				this.$http.post(this.$api.loginOut, { access_token: this.userInfo.access_token }).then(res => {
						WebSocketExit();
						//this.emptyUserInfo();
						uni.setStorageSync("logout","true");
						uni.showToast({
							title: "退出成功",
							duration: 1500
						});
						setTimeout(() => {
							uni.reLaunch({
								url: "../../login/login"
							});
						}, 1500);
					});
			}
		},
		navigateTo() {
			uni.navigateTo({
				url: "../editPwd/editPwd"
			});
		},
		editUserInfo(data) {
			this.$http.put(this.$api.updateUserInfo, data).then(res => {
				this.modalData = Object.assign({}, data);
				updateSetLoginUserInfo(); // 获取用户信息
				this.$u.toast("修改成功");
			});
		}
	},
	computed: {
		...mapState({
			userInfo: state => state.userInfo,
			loginUserInfo: state => state.loginUserInfo
		})
	}
};
</script>

<style lang="scss" scoped src="../css/userInfo.scss"></style>
