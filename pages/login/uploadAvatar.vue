<template>
	<view class="bodyMain">
		<view class="flex-space-around  uploadBox">
			<view class="avatarBox flex-center">
				<text class="title">头像</text>
				<view class="flex-center avatar" v-if="avatar.length">
					<image class="m-icon" :src="avatar[0]" @click="seeAvatar" mode="aspectFill"></image>
				</view>
				<view class="flex-center userIcon avatar" v-else>
					<u-icon name="account-fill" />
				</view>
				<text>请选择一张照片作为您的头像</text>
			</view>
			<u-button v-if="!avatar.length" shape="circle" class="m-btn pink uploadBtn" @click="selectAvatar"
				hover-class="none">选择头像</u-button>
			<u-button v-else shape="circle" class="m-btn pink uploadBtn" @click.stop="regSuccess" hover-class="none">
				注册完成
			</u-button>
		</view>
		<view class="textBox flex-center">
			<text>Privacy & terms</text>
			<text class="center">Need help?</text>
			<text>© 2021 91Uber</text>
		</view>
	</view>
</template>

<script>
	import {
		uploadFile
	} from '@/common/js/filerequest.js'
	export default {
		data() {
			return {
				avatar: [], // 选择的图片列表
				uploadAvatar: undefined, //上传之后图片地址
			};
		},
		methods: {
			selectAvatar() {
				// 选择头像
				const that = this
				uni.chooseImage({
					count: 1,
					sizeType: ['original'],
					success: e => {
						this.avatar = e.tempFilePaths
						uploadFile({
							url: this.$api.imgUpload,
							filePath: e.tempFilePaths[0],
							name: 'file',
							formData: {
								'folderPath': 'danners'
							},
							loading: true,
							success: (res) => {
								that.uploadAvatar = 'https://' + res.result;
							},
							fail: (err) => {
								uni.showToast({
									title: '头像上传失败，请重新上传',
									icon: 'none',
									success() {
										that.avatar = []
									}
								})
							}
						});
					}
				});
			},
			regSuccess() {
				if (!this.uploadAvatar) {
					const that = this
					return uni.showToast({
						title: '头像上传失败，请重新上传',
						icon: 'none',
						success() {
							that.avatar = []
						}
					})
				}
				this.$http.put(this.$api.updateUserInfo, {
					'avatar': this.uploadAvatar
				}).then(res => {
					uni.showToast({
						title:'注册成功',
						success() {
							setTimeout(() => {
								uni.switchTab({
									url: '../heart/heart'
								});
							}, 1000);
						}
					})
				})
			},
			seeAvatar() {
				// 查看头像
				uni.previewImage({
					urls: this.avatar,
					success: e => {
						console.log('当前查看的图片：', e);
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped src="./css/uploadAvatar.scss"></style>
