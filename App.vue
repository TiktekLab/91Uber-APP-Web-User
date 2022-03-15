<script>
	import push from "@/common/js/push.js";
	import { mapState, mapMutations } from "vuex";
	import { launchCall, loginCall, login, refreshToken } from "@/common/js/common.js";
	import { webSocketConnect, WebSocketClose } from "@/common/js/webSocketPush.js";
	export default {
		onLaunch: function() {
			//监听推送
			push(this);
			setTimeout(() => {
				plus.navigator.closeSplashscreen();
			}, 2000);
			uni.hideTabBar();
			launchCall();
			this.updateApp();
			this.autoLogin();	
		},
		data() {
			return {
				hideFlag: false
			}
		},
		computed:{
			...mapState(["messageClick"]),
		},
		methods: {
			...mapMutations(["setUserInfo"]),
			autoLogin() {
				const userData =  uni.getStorageSync("saveLogin");
				const logout = uni.getStorageSync("logout");
				if(logout && userData) {
					if(!this.messageClick) {
						uni.reLaunch({
							url:"/pages/login/login"
						})						
					}
					return;
				}
				login().then(res=> {					
					loginCall();
					refreshToken();
					uni.removeStorageSync("logout");
					if(!this.messageClick) {
						uni.switchTab({
							url: "../heart/heart"
						});								
					}
				})
			},
			updateApp() {
				// #ifdef APP-PLUS
				const that = this;
				plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
					that.$http.get(that.$api.getVersion, { type: 1, codeMin: widgetInfo.versionCode }, {
						header: {
							Authorization: that.$base.authorization,
							number: that.$base.authNumber
						},
						tokenRequired: false
					}).then(res => {
						//console.log("Version:", res);
						const versionInfo = res.edition;
						if(versionInfo.isForcedUpdate) {							
							uni.downloadFile({
							    url: plus.os.name === "Android" ? versionInfo.androidUrl : versionInfo.iosUrl,  
							    success: (downloadResult) => {  
							        if (downloadResult.statusCode === 200) {  
							            plus.runtime.install(downloadResult.tempFilePath, {  
							                force: false  
							            }, function() {  
											uni.showModal({
												title: versionInfo.title || "更新提示",
												content: versionInfo.description || "已为您准备好新版本，是否重启App安装更新？",
												success(res) {
													if (res.confirm) {
														plus.runtime.restart();
													}
												}
											})			                
							            }, function(e) {  
							                console.error('install fail...');  
							            });  
							        }  
							    }  
							});
						}
					})
				})
				// #endif				
			}
		},
		onShow() {
			if(this.hideFlag){
				webSocketConnect();
				loginCall();
			}
		},
		onHide() {
			this.hideFlag = true;
			WebSocketClose();
		}
	};
</script>

<style lang="scss">
	/*每个页面公共css */
	/* #ifndef APP-NVUE */
	@import "uview-ui/index.scss";
	/* #endif */
	@import url("./common/css/common.scss");
	@import url("./common/css/global.scss");
	@import url("./components/gaoyia-parse/parse.css");
</style>
