<template>
	<view class="bodyMain hideScroll">
		<u-navbar back-icon-name="arrow-leftward" title="注册" back-icon-size="36" :background="{ background: '#F0F2F3' }" :border-bottom="false" />
		<view class="registerForm">
			<u-form :model="formData" :error-type="['toast']" ref="regForm" class="form" label-position="top">
				<u-form-item label="昵称" :border-bottom="false" prop="name">
					<input class="input" v-model="formData.name" placeholder="请输入昵称" type="text" />
				</u-form-item>
				<u-form-item label="电话" :border-bottom="false" prop="phone">
					<text class="prefix medium">+61</text><input class="input" v-model="formData.phone" placeholder="请输入手机号" type="number" />
				</u-form-item>
				<u-form-item label="验证码" :border-bottom="false" prop="code">
					<input class="input" v-model="formData.code" placeholder="请输入验证码" type="number" />
					<u-button slot="right" hover-class="none" class="getCode pink m-btn" size="mini" @click="getCode">
						{{ codeTips }}
					</u-button>
				</u-form-item>
				<u-form-item label="州" :border-bottom="false" prop="province">
					<view @click.stop="showStateList()" class="parentInput">
						<input class="input" v-model="formData.province" disabled="true" placeholder="请选择州" />
					</view>
				</u-form-item>
				<u-form-item label="Suburb" :border-bottom="false" prop="city">
					<input class="input" v-model="formData.city" placeholder="请输入Suburb" />
				</u-form-item>
				<u-form-item label="邮箱(注册真实邮箱可收到最新员工更新信息)" :border-bottom="false" prop="email">
					<input class="input" v-model="formData.email" placeholder="请输入邮箱" />
				</u-form-item>
				<u-form-item label="密码" :border-bottom="false" prop="pwd">
					<input class="input" v-model="formData.pwd" placeholder="请输入密码" type="password" :type="isShowPwd ? 'text' : 'password'"/>
					<text slot="right" class="iconfont eye" @click="switchType()">{{ isShowPwd ? "&#xe68e;" : "&#xe68d;" }}</text>
				</u-form-item>
			</u-form>
		</view>
		<view class="bottom">
			<view class="footer  flex-start">
				<view class="circle flex-center" @click="literature = !literature">
					<u-icon name="checkmark" size="40" v-if="literature" color="#992F65" />
				</view>
				<text class="circleInfo" @click="literature = !literature">点击注册按钮即表示您已同意我们的</text>
				<text class="circleInfo" :href="href" @click="openURL" >91UBER 隐私政策》</text>
			</view>
			<view class="footer  flex-start" @click="isAdult = !isAdult">
				<view class="circle flex-center">
					<u-icon name="checkmark" size="40" v-if="isAdult" color="#992F65" />
				</view>
				<text class="circleInfo">我已满18周岁</text>
			</view>
			<u-button hover-class="none" @click="submit" plain class="submit pink m-btn">注册</u-button>
			<view :class="['flex-center  login', { isAndroid: isAndroid }]">
				<text>已有账户? 现在</text>
				<text class="active" @click="navigateTo('login')">登录</text>
			</view>
		</view>
		<u-verification-code seconds="60" ref="uCode" @change="codeChange"></u-verification-code>		
		<u-action-sheet v-model="showState" :list="stateOptions" title="请选择州" border-radius="20" @click="stateSelect" safe-area-inset-bottom></u-action-sheet>
	</view>
</template>

<script>
	import { uploadFile } from "@/common/js/filerequest.js";
	import { mapMutations } from "vuex";
	import { loginCall, refreshToken } from "@/common/js/common.js";
	const rules = require("@/common/js/rules.js"); // 表单校验
	export default {
		data() {
			return {
				rules, // 表单校验
				literature: false, // 隐私政策
				isShowPwd: false,
				isAdult: false,
				href:'https://www.91uber.com/legaldoc',
				formData: {
					name: undefined,
					phone: undefined,
					code: undefined,
					avatar: undefined,
					email: undefined,
					pwd: undefined,
					province: undefined,
					city: undefined,
				},
				codeTips: "", // 发送验证码状态	
				showState: false,
				stateOptions: [
					{
					  text: 'NSW'
					},
					{
					  text: 'VIC'
					},
					{
					  text: 'WA'
					},
					{
					  text: 'SA'
					},
					// {
					//   text: 'QLD'
					// },
					{
					  text: 'TAS'
					},
					{
					  text: 'NT'
					},
					{
					  text: 'ACT'
					}				
				],
			};
		},
		onReady() {
			const data = {
				validator: (rule, value, callback) => {
					return value === this.formData.pwd;
				},
				message: "两次输入的密码不一致！",
				trigger: ["change", "blur"]
			};
			if (this.rules.confirmPwd.length > 1) {
				this.rules.confirmPwd.splice(1, 1, data);
			} else {
				this.rules.confirmPwd.push(data);
			}
			this.$refs.regForm.setRules(this.rules);
		},
		methods: {
			...mapMutations(["setUserInfo", "emptyUserInfo"]),
			navigateTo(e) {
				uni.navigateTo({
					url: "./" + e
				});
			},
			openURL() {
				// #ifdef APP-PLUS
				plus.runtime.openURL(this.href)
				// #endif
			},
			codeChange(text) {
				this.codeTips = text;
			},
			getCode() {
				// 获取验证码
				if (this.$refs.uCode.canGetCode) {
					uni.showLoading({
						title: "正在获取验证码",
						mask: true
					});
					this.$http.post(this.$api.sendRegisterCode, { phone: '0'+ this.formData.phone }, {
								header: {
									number: this.$base.authNumber
								},
								load: true,
								tokenRequired: false
							}
					).then(res => {
						uni.hideLoading();
						this.$u.toast("验证码已发送");
						this.$refs.uCode.start();
						console.log("验证码：", res);						
					});
				} else {
					this.$u.toast("倒计时结束后再发送");
				}
			},
			submit() {
				// 注册
				this.$refs.regForm.validate(res => {
					if (res) {
						if (!this.literature) return this.$u.toast("请勾选协议");
						if (!this.isAdult) return this.$u.toast("必须年满18周岁");
						const registerData = {...this.formData};
						registerData.phone = '0'+ registerData.phone;
						this.$http.post(this.$api.register, registerData, {
								load: true,
								header: {
									number: this.$base.authNumber
								},
								tokenRequired: false
							}).then(res => {
								this.emptyUserInfo();
								uni.removeStorageSync("saveLogin");							
								this.login();
							});
					}
				});
			},
			login() {
				const data = {
					username: '0'+ this.formData.phone,
					password: this.formData.pwd
				};
				// 登录
				this.$http.post(this.$api.login + `?grant_type=${this.$base.grantType}`, data, {
						load: true,
						tokenRequired: false,
						header: {
							"Content-Type": "application/x-www-form-urlencoded",
							Authorization: this.$base.authorization
						}
					}).then(res => {
						this.setUserInfo(res);
						loginCall();
						data.username = data.username.substr(1);
						uni.setStorageSync("saveLogin", data); // 记住登录账号密码
						uni.removeStorageSync("logout");
						this.$u.toast("注册成功");
						refreshToken();
						setTimeout(() => {
							uni.switchTab({
								url: "../heart/heart"
							});
						}, 1000);
					});
			},
			switchType() {
				this.isShowPwd = !this.isShowPwd;
			},
			showStateList(){
				this.showState = true;
			},
			stateSelect(index) {		
				this.formData.province = this.stateOptions[index].text;
			}
		}
	};
</script>

<style lang="scss" scoped src="./css/register.scss"></style>
