<template>
	<view class="bodyMain hideScroll">
		<u-navbar back-icon-name="arrow-leftward" title="忘记密码" back-icon-size="36" :background="{ background: '#F0F2F3' }" :border-bottom="false" />
		<view class="registerForm">
			<u-form :model="formData" ref="regForm" :error-type="['toast']" class="form" label-position="top">
				<u-form-item label="电话" :border-bottom="false" prop="phone">
					<text class="prefix">+61</text><input class="input" v-model="formData.phone" placeholder="请输入手机号" type="number" />
				</u-form-item>
				<u-form-item label="验证码" :border-bottom="false" prop="code">
					<input class="input" v-model="formData.code" placeholder="请输入验证码" type="number" />
					<u-button slot="right" hover-class="none" class="getCode pink m-btn" size="mini" @click="getCode">{{ codeTips }}</u-button>
				</u-form-item>
				<u-form-item label="密码" :border-bottom="false" prop="pwd">
					<input class="input" v-model="formData.pwd" placeholder="请输入密码" :type="isShowPwd[0].type ? 'text' : 'password'" />
					<text class="iconfont eye" @click="switchType(0)">{{ isShowPwd[0].type ? '&#xe68e;' : '&#xe68d;' }}</text>
				</u-form-item>
				<u-form-item label="确认密码" :border-bottom="false" prop="confirmPwd">
					<input class="input" v-model="formData.confirmPwd" placeholder="请重新输入密码" :type="isShowPwd[1].type ? 'text' : 'password'"  />
					<text class="iconfont eye" @click="switchType(1)">{{ isShowPwd[1].type ? '&#xe68e;' : '&#xe68d;' }}</text>
				</u-form-item>
			</u-form>
		</view>
		<view :class="['PreciseSearch absoluteBtn padding ', { isAndroid: isAndroid }]">
			<u-button hover-class="none" @click="submit" plain class="searchBtn submit pink m-btn">确认并保存</u-button>
		</view>
		<u-verification-code seconds="60" ref="uCode" @change="codeChange" />
	</view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
const rules = require("@/common/js/rules.js"); // 表单校验
export default {
	data() {
		return {
			rules, // 表单校验
			formData: {
				phone: undefined,
				code: undefined,
				pwd: undefined,
				confirmPwd: undefined
			},
			isShowPwd: [{type:false},{type:false}],
			codeTips: "" // 发送验证码状态
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
		let phone = this.loginUserInfo.boundPhone;
		if(phone) {
			phone = phone.substr(1);			
		}
		this.formData.phone = phone;
	},
	methods: {
		...mapMutations(["setUserInfo", "emptyUserInfo"]),
		switchType(index) {
			this.isShowPwd[index].type = !this.isShowPwd[index].type
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
				this.$http.post(this.$api.sendResetPwdCode,{ phone: "0" + this.formData.phone },
						{
							header: { number: this.$base.authNumber },
							load: true,
							tokenRequired: false
						}
					).then(res => {
						uni.hideLoading();
						this.$u.toast("验证码已发送");
						this.$refs.uCode.start();
					});
			} else {
				this.$u.toast("倒计时结束后再发送");
			}
		},
		submit() {
			// 重置密码
			this.$refs.regForm.validate(res => {
				if (res) {
					const data = {...this.formData};
					data.phone = "0" + data.phone;
					this.$http.post(this.$api.resetPwd, data, {
							load: true,
							header: {
								number: this.$base.authNumber
							},
							tokenRequired: false
						}).then(res => {
							this.$u.toast("密码重置成功");
							uni.removeStorageSync("logout");
							uni.removeStorageSync("saveLogin");	
							setTimeout(function() {
								uni.navigateTo({
									url: "./login"
								});
							}, 1000);
						});
				}
			});
		}
	},
	computed: {
		...mapState({
			loginUserInfo: state => state.loginUserInfo
		})
	}
};
</script>

<style lang="scss" scoped src="./css/register.scss"></style>
