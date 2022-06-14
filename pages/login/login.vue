<template>
	<view class="bodyMain">
		<view class="mask flex-end">
			<view class="centent">
				<text class="title flex-start">
					澳洲最大华人交友平台
				</text>
				<!-- <text class="title second flex-start">华人走肾交友平台</text> -->
				<u-form :model="loginData" :error-type="['toast']" ref="loginForm" class="form" label-position="top">
					<u-form-item label="电话" prop="username">
						<text class="prefix loginWhite">+61</text><input class="input" v-model="loginData.username"
							placeholder-style="color:rgba(255, 255, 255, 0.34)" placeholder="输入电话号码" type="number" />
					</u-form-item>
					<u-form-item label="密码" prop="password" class="white">
						<input class="uni-input-input input" v-model="loginData.password"
							placeholder-style="color:rgba(255, 255, 255, 0.34)" placeholder="输入密码"
							:type="isShowPwd ? 'text' : 'password'" />
						<text class="iconfont eye loginWhite"
							@click="switchType()">{{ isShowPwd ? "&#xe68e;" : "&#xe68d;" }}</text>
					</u-form-item>
				</u-form>
				<view class="flex-space-between loginInfo">
					<view class="flex-start">
						<view class="footer  flex-start" @click="saveLogin = !saveLogin">
							<view class="circle flex-center">
								<u-icon name="checkmark" size="40" v-if="saveLogin" color="#FFFFFF" />
							</view>
							<text class="circleInfo">记住密码</text>
						</view>
						<view class="footer  flex-start" @click="isAdult = !isAdult" style="margin-left: 50rpx">
							<view class="circle flex-center">
								<u-icon name="checkmark" size="40" v-if="isAdult" color="#FFFFFF" />
							</view>
							<text class="circleInfo">我已满18周岁</text>
						</view>
					</view>
					<text class="Forget flex-center" @click="navigateTo('forgetPwd')">忘记密码</text>
				</view>

				<view class="loginFoot flex-start">
					<u-button hover-class="none" @click="login" size="medium" plain class="login  m-btn">登录</u-button>
					<view class="flex-start regBtn" @click="navigateTo('register')">
						<text>没有账号，现在</text>
						<text class="active">注册！</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations
	} from "vuex";
	import {
		loginCall,
		refreshToken
	} from "@/common/js/common.js";
	const rules = require("@/common/js/rules.js"); // 表单校验
	export default {
		data() {
			return {
				rules, // 表单验证
				saveLogin: false, // 保存用户信息
				isAdult: false,
				isShowPwd: false,
				loginData: {
					username: undefined,
					password: undefined
				}
			};
		},
		onLoad() {
			this.emptyUserInfo();
		},
		onReady() {
			this.$refs.loginForm.setRules(this.rules);
			const userData = uni.getStorageSync("saveLogin");
			if (userData) {
				this.saveLogin = true;
				this.loginData = Object.assign({}, userData);
			}
		},
		methods: {
			...mapMutations(["setUserInfo", "emptyUserInfo"]),
			navigateTo(e) {
				uni.navigateTo({
					url: "./" + e
				});
			},
			login() {
				this.$refs.loginForm.validate(res => {
					if (res) {
						if (!this.isAdult) return this.$u.toast("必须年满18周岁");
						const data = {
							...this.loginData
						};
						data.username = '0' + data.username;
						this.$http.post(this.$api.login + `?grant_type=${this.$base.grantType}`, data, {
							load: true,
							tokenRequired: false,
							header: {
								"Content-Type": "application/x-www-form-urlencoded",
								Authorization: this.$base.authorization
							}
						}).then(res => {
							if (this.saveLogin) {
								uni.setStorageSync("saveLogin", this.loginData); // 记住密码
							} else {
								uni.removeStorageSync("saveLogin");
							}
							this.setUserInfo(res);
							loginCall();
							uni.removeStorageSync("logout");
							this.$u.toast("登录成功");
							refreshToken();
							setTimeout(() => {
								uni.switchTab({
									url: "../heart/heart"
								});
							}, 1000);
						});
					} else {
						console.log("校验失败");
					}
				});
			},
			switchType() {
				this.isShowPwd = !this.isShowPwd;
			},
		}
	};
</script>

<style lang="scss" scoped src="./css/login.scss"></style>
