<template>
	<view class="bodyMain bodyBG hideScroll" style="overflow: auto;">
		<view class="padding">
			<view class="searchBox">
				<view class="search flex-start" @click="citiesSearch()">
					<view class="searchIconBox flex-center"><text class="iconfont searchIcon">&#xe60a;</text></view>
					<text class="title">区域搜索</text>
				</view>			
			</view>
			<view class="canBook">
				<view class="hotService flex-space-between ">
					<view class="item m-radius" @click="navigateTo('nearby')">
						<view class="centent flex-space-between">
							<view>
								<u-icon class="ico" name="map-fill" color="#992F65" size="36"></u-icon>
								附近可约
							</view>
						</view>
					</view>
					<view class="item m-radius" @click="navigateTo('current')">
						<view class="centent flex-space-between m-radius">
							<view>
								<u-icon class="ico" name="clock-fill" color="#992F65" size="36"></u-icon>
								当前可约
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>		
		<swiper class="swiper" autoplay indicator-dots indicator-active-color="#fff">
			<swiper-item class="flex-center banner" v-for="(item, index) in indexBannerItem" :key="index">
				<u-image height="510" width="750" :src="item.image" mode="aspectFill" @click="bannerClick(item)"/>
			</swiper-item>
		</swiper>
		<view :class="['serviceContent padding', { isAndroid: isAndroid }]">
			<text class="serviceTitle flex-space-around">服务分类</text>
			<view class="serviceItem flex-space-between">
				<view class="item" v-for="(item, index) in staffCategory" :key="index" @click="navigateTo(item.id)">
					<view class="centent flex-space-around">
						<u-image height="75" width="75" :src="item.image" mode="aspectFill" />
						<text class="title">{{ item.content }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 自定义tabBar -->
		<tabBar ref="tabBar" :active="0" />		
	</view>
</template>

<script>
	import commonData from "@/common/js/data.js";
	import tabBar from "../../component/tabBar/tabBar.vue";
	import moment from "moment";
	import { mapState, mapGetters, mapMutations } from "vuex";
	import { getSearchHistoryList } from "@/common/js/localDatabase.js";
	import { queryEmployeeList } from "@/common/js/apiCommon.js";
	import { myLocation, noLocationPrompt, openLink } from "@/common/js/common.js";	
	//const currnetDate = moment().format("YYYY-MM-DD");
	let intervalID = null;
	export default {
		components: {
			tabBar
		},
		data() {
			return {
				indexBannerItem: [],
				currentlyAvailable: undefined,
				accessoryPerson: undefined,
				searcHistoryList: [],
				canBookNearbyNum: 0, //附近可约
				canBookNowNum: 0, //当前可约
				hotCities: commonData.hotSearchCities, //热门搜索
			};
		},
		onLoad() {		
			uni.hideTabBar();	
			if (this.loginUserId) { this.getHistoryList(); }
			this.getData();
			myLocation();
		},
		onReady() {
			uni.$on("updateHistory", () => {
				this.getHistoryList();
			});	
			uni.$on("autoUpdateByPushMsg", () => {
				this.getCountByLocation();
			});			
		},
		onShow() {
			intervalID = setInterval(()=> {
				this.getCountByLocation();				
			}, 6000);
		},
		onHide() {
			if(intervalID) clearInterval(intervalID);
		},
		onUnload() {
			uni.$off("updateHistory");
			uni.$off("autoUpdateByPushMsg");
		},
		methods: {
			...mapMutations(["setSearchCities"]),
			//区域搜索
			citiesSearch() {
				uni.navigateTo({
					url: "./search/search"
				});
			},
			navigateTo(type) {
				this.setSearchCities([]);
				const params = {};
				if(!this.currentLocation.province || !this.currentLocation.city){
					noLocationPrompt();
					return;					
				} else {					
					if(type === 'nearby'){
						params.cityList = [`${this.currentLocation.province},${this.currentLocation.city}`];
					} else if(type === 'current'){
						//params.queryTime = currnetDate;
						params.province = this.currentLocation.province;		
					} else {	
						params.classificationIdList = [type];
						params.province = this.currentLocation.province;	
					}
				}
				uni.setStorageSync("filterParameters", params);
				let toUrl = "./searchList/searchList?from=home";
				//当前可约不显示推荐
				if(type !== "current"){
					toUrl += "&recommend=true";
				}
				uni.navigateTo({
					url: toUrl
				});
			},
			//type搜索
			typeSearch(categoryId) {
				uni.navigateTo({
					url: "./searchFilter/searchFilter?categoryId=" + categoryId
				});
			},
			getData() {
				this.$http.get(this.$api.indexBannerList).then(res => {
					this.indexBannerItem = res.list;
				});
				this.$http.get(this.$api.currentlyAvailable).then(res => {
					this.currentlyAvailable = res.currentlyAvailable;
				});
				this.$http.get(this.$api.accessoryPerson).then(res => {
					this.accessoryPerson = res.accessoryPerson;
				});
			},
			getHistoryList() {
				getSearchHistoryList(1, 2).then(res => {
					this.searcHistoryList = res.list;
				});
			},
			bannerClick(item){
				openLink(item.link);
			},
			//跳转搜索结果页面
			jumpToSearchList(item){	
				this.setSearchCities([{...item, fullCityLabel:item.fullCity, type:2, choose:true}]);
				uni.navigateTo({
					url: "searchList/searchList?from=home&recommend=true"
				});
			},
			getCountByLocation(){				
				if (this.currentLocation && "city" in this.currentLocation) {
					//查询附近可约人数
					queryEmployeeList({
						page: 1,
						limit: 1,
						status: 1,
						cityList: [`${this.currentLocation.province},${this.currentLocation.city}`]
					}, false).then(res => {
						this.canBookNearbyNum = res.result.count;
					});					
					
					//查询当前可约
					queryEmployeeList({
						page: 1,
						limit: 1,
						status: 1,
						//queryTime: currnetDate,
						province: this.currentLocation.province
					}, false).then(res => {
						this.canBookNowNum = res.result.count;
					});
				}
			}
		},
		computed: {
			...mapState({
				staffCategory: state => state.staffCategory,
				currentLocation: state => state.currentLocation
			}),
			...mapGetters(["loginUserId"]),
		},
		watch: {
			currentLocation() {
				this.getCountByLocation();
			},
			loginUserId() {
				if (this.loginUserId) this.getHistoryList(); 
			}
		}
	};
</script>

<style lang="scss" scoped src="./css/heart.scss"></style>
