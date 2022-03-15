<template>
	<view class="bodyMain">
		<u-navbar title="编辑个人信息">
			<view slot="right" class="navBar" @click="saveUserInfo">
				<u-icon name="checkmark" />
			</view>
		</u-navbar>
		<view class="avatarBox flex-center">
			<view class="avatar flex-center" v-if="avatar">
				<image @click="seeAvatar" class="m-icon" :src="avatar" mode="aspectFill"></image>
			</view>
			<view class="flex-center userIcon avatar" @click="selectAvatar" v-else>
				<u-icon name="account-fill" />
			</view>
			<text @click="selectAvatar">更换头像</text>
		</view>
		<view class="item padding">
			<text class="title">昵称</text>
			<view class="input">
				<input v-model="nickName" class="input border" type="text" placeholder="请输入昵称" />
			</view>
		</view>
	</view>
</template>

<script>
	import { uploadFile } from '@/common/js/filerequest.js';
	import { updateSetLoginUserInfo } from "@/common/js/storeCommon.js";
	export default {
		data() {
			return {
				nickName: undefined,
				userId: undefined,
				avatar: undefined, //头像
			};
		},
		onLoad(option) {
			const that = this
			if (option) {
				this.userId = option.userId;
			}
			const eventChannel = this.getOpenerEventChannel()
			eventChannel.on('acceptDataFromOpenerPage', function(data) {
				if (data) {
					that.avatar = data.avatar;
					that.nickName = data.nickName;
				} else {
					uni.navigateBack();
				}
			})
		},
		methods: {
			selectAvatar() {
				const that = this
				// 选择本地头像
				uni.chooseImage({
					count: 1,
					sizeType: ['original'],
					success: e => {
						this.avatar = e.tempFilePaths[0];
						uploadFile({
							url: this.$api.imgUpload,
							filePath: this.avatar,
							name: 'file',
							formData: {
								'folderPath': 'danners'
							},
							loading: true,
							success: (res) => {
								that.avatar = 'https://' + res.result;
							},
							fail: (err) => {
								uni.showToast({
									title: '头像上传失败，请重新上传',
									icon: 'none',
									success() {
										that.avatar = null;
									}
								})
							}
						});
					}
				});
			},
			seeAvatar() {
				// 查看头像
				uni.previewImage({
					urls: [this.avatar],
					success: e => {
						console.log('当前查看的图片：', e);
					}
				});
			},
			saveUserInfo() {
				if (!this.avatar) {
					return uni.showToast({
						title: '请上传头像',
						icon: 'none'
					})
				}
				if (!this.nickName) {
					return uni.showToast({
						title: '请输入昵称',
						icon: 'none'
					})
				}
				if (this.nickName.trim().length < 2 || this.nickName.trim().length > 20) {
					return uni.showToast({
						title: '昵称长度2-20位之间',
						icon: 'none'
					})
				}
				this.$http.put(this.$api.updateUserInfo, {
					'avatar': this.avatar,
					'nickName': this.nickName
				}).then(res => {
					updateSetLoginUserInfo();
					uni.showToast({
						title: '修改成功',
						duration: 1500
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				})
			}
		}
	};
</script>

<style lang="scss" scoped src="../css/editUserInfo.scss"></style>
