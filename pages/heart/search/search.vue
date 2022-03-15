<template>
	<view class="bodyMain bodyBG hideScroll" style="overflow: auto;">
		<!-- 搜索框 -->
		<view class="status_bar"></view>
		<view class="searchBox padding flex-space-between">
			<view class="searchIconBox flex-center"><text class="iconfont searchIcon">&#xe60a;</text></view>
			<view class="centent">
				<view class="addressList flex">
					<text class="item flex-center" v-for="(item, index) in chooseCityList"
						:key="index">{{ item.fullCityLabel }}</text>
				</view>
				<input class="input" placeholder-style="color: #B4B4B4; fontSize: 24rpx;font-family: PingFangSCRegular;"
					v-model="searchData" placeholder="区域搜索" @input="getAddressList" />
			</view>
			<text v-if="chooseCityList.length>0" class="delIcon flex-center iconfont" @click="onCancel">&#xe605;</text>
			<text class="flex-end cancel" @click="goHome">取消</text>
		</view>
		<!-- 添加当前位置 -->
		<view class="myPosition padding flex-space-between" @click="choosePlace(locationObj, 3)">
			<view class="left flex-start">
				<text class="iconfont">&#xe67d;</text>
				<text>添加当前位置</text>
			</view>
			<text v-if="locationObj.choose" class="iconfont plus">&#xe656;</text>
			<text v-else class="iconfont plus">&#xe686;</text>
		</view>
		<!-- 搜索此区域的人 -->
		<view v-if="citiesEmployee.length > 0" class="persons flex-space-between padding" @click="citiesSearch()">
			<view class="left flex-start">
				<view class="avatarBox flex-space-around">
					<view class="avatar flex-center" v-for="(item, index) in citiesEmployee" :key="item.id">
						<image class="m-icon" :src="item.avatar" mode="aspectFill" />
					</view>
				</view>
				<text class="title">搜索此区域的人?</text>
			</view>
			<view class="right">
				<u-icon name="arrow-right" />
			</view>
		</view>
		<!-- 建议 -->
		<view v-if="autocompleteList.length > 0" class="searcPlace ">
			<view class="searchTitle flex-start padding"><text>建议</text></view>
			<view>
				<view class="searchList  flex-space-between" @click="choosePlace(item, 1)"
					v-for="item in autocompleteList" :key="item.place_id">
					<view class="flex-start">
						<view class="searchIcon flex-center"><text class="iconfont">&#xe60a;</text></view>
						<view class="content hideScroll">
							<text>{{ item.fullCity }}</text>
						</view>
					</view>
					<text v-if="item.choose" class="iconfont plus">&#xe656;</text>
					<text v-else class="iconfont plus">&#xe686;</text>
				</view>
			</view>
		</view>
		<!-- 搜索历史 -->
		<view v-if="historyList.length > 0" class="searcPlace history ">
			<view class="searchTitle flex-start padding"><text>搜索历史</text></view>
			<uni-swipe-action>
				<uni-swipe-action-item @click="delHistory($event,item)" :right-options="swipeAction"
					v-for="item in historyList" :key="item.id">
					<view class="searchList  flex-space-between" @click="choosePlace(item, 2)">
						<view class="flex-start">
							<view class="searchIcon flex-center"><text class="iconfont">&#xe60a;</text></view>
							<view class="content hideScroll">
								<text>{{ item.fullCity }}</text>
							</view>
						</view>
						<text v-if="item.choose" class="iconfont plus">&#xe656;</text>
						<text v-else class="iconfont plus">&#xe686;</text>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</view>
		<view v-else class="searcPlace history ">
			<view class="searchTitle flex-start padding"><text>热门搜索</text></view>
			<uni-swipe-action>
				<uni-swipe-action-item v-for="item in hotCities" :key="item.place_id">
					<view class="searchList  flex-space-between" @click="choosePlace(item, 4)">
						<view class="flex-start">
							<view class="searchIcon flex-center"><text class="iconfont">&#xe60a;</text></view>
							<view class="content hideScroll">
								<text>{{ item.fullCity }}</text>
							</view>
						</view>
						<text v-if="item.choose" class="iconfont plus">&#xe656;</text>
						<text v-else class="iconfont plus">&#xe686;</text>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</view>		
		<!-- 继续精确搜索 -->
		<view :class="['PreciseSearch absoluteBtn padding ', { isAndroid: isAndroid }]">
			<u-button hover-class="none" plain class="searchBtn  pink  m-btn" @click="navigateTo">继续精确搜索</u-button>
		</view>
	</view>
</template>
<script>
	import commonData from "@/common/js/data.js";
	import { mapState, mapMutations } from "vuex";
	import { googleMapPlaceAutocomplete } from "@/common/js/googleMap.js";
	import { queryEmployeeList } from "@/common/js/apiCommon.js";
	import { getSearchHistoryList, saveSearchHistory, deleteHistory } from "@/common/js/localDatabase.js";
	import { noLocationPrompt } from "@/common/js/common.js";
	export default {
		data() {
			return {
				searchData: undefined, // 搜索地址
				autocompleteList: [], //搜索建议地址
				chooseCityList: [], //选择的搜索区域列表
				historyList: [], //历史记录地址
				citiesEmployee: [], //查询员工列表
				locationObj: {
					fullCityLabel: "当前区域",
					choose: false,
					type: 3 //当前位置
				},
				isCancel: false,  // 是否显示清空按钮
				swipeAction: [{
					text: "删除",
					style: {
						backgroundColor: "#FC4850"
					}
				}],
				hotCities: [], //热门搜索
			};
		},
		onLoad() {
			this.getHistoryList();
			this.updateCurrentLocation();
			this.setSearchCities([]); //清空区域搜索数据
			this.hotCities = commonData.hotSearchCities.map(item => {
				return {...item}
			})
		},
		computed: {
			...mapState({
				searchCities: state => state.searchCities,
				currentLocation: state => state.currentLocation
			})
		},
		watch: {
			currentLocation() {
				this.updateCurrentLocation();
			}
		},
		methods: {
			...mapMutations(["setSearchCities"]),
			goHome() {
				uni.switchTab({
					url: "../heart"
				});
			},
			onCancel() {  // 清空搜索区域和内容
				this.chooseCityList = [];
				this.citiesEmployee = [];
				this.searchData = undefined;
				this.isCancel = false;
			},
			delHistory(e, data) { // 删除搜索历史
				if (e.index === 0) {
					deleteHistory(data.id).then(res => {
						this.getHistoryList();
						uni.$emit("updateHistory");
					})
				}
			},
			navigateTo() {
				this.saveHistory();
				//存储Cities数据
				this.setSearchCities(this.chooseCityList);
				uni.navigateTo({
					//精确搜索
					url: "../searchFilter/searchFilter"
				});
			},
			getAddressList({detail}) {
				if(!this.isCancel) this.isCancel = true;
				googleMapPlaceAutocomplete(detail.value).then(res => {
					this.autocompleteList.splice(0, this.autocompleteList.length, ...res);
				});
			},
			//选择地址
			choosePlace(obj, type) {
				//1.搜索建议，2.历史记录，3.当前定位，4.热门搜索区域
				if (type === 3 && !obj.city) {
					noLocationPrompt();
					return;
				}
				obj.choose = !obj.choose;
				const containsIndex = this.chooseCityList.findIndex(item => item.type === type && item.fullCity === obj.fullCity);
				if (containsIndex > -1) {
					this.chooseCityList.splice(containsIndex, 1);
				} else {
					this.chooseCityList.push(obj);
					this.searchData = "";
				}
				this.getEmployeeList();
			},
			//查询搜索历史数据
			getHistoryList() {
				getSearchHistoryList(1, 20).then(res => {
					const resultList = res.list.map(item => {
						return {
							id: item.id,
							place_id: item.place_id,
							city: item.city,
							province: item.province,
							fullCity: item.fullCity,
							fullCityLabel: item.fullCity,
							choose: false,
							type: 2 //搜索历史
						};
					});
					this.historyList.splice(0, this.historyList.length, ...resultList);
				});
			},
			//搜索区域内员工
			getEmployeeList() {
				const chooseCities = this.chooseCityList.map(item => {
					return item.province + "," + item.city;
				});
				const cityList = [...new Set(chooseCities)];
				if (cityList.length > 0) {
					queryEmployeeList({
						page: 1,
						limit: 4,
						cityList,
						status:1
					}, false).then(res => {
						this.citiesEmployee.splice(0, this.citiesEmployee.length, ...res.result.data);
					});
				} else {
					this.citiesEmployee.splice(0, this.citiesEmployee.length);
				}
				//存储Cities数据
				this.setSearchCities(this.chooseCityList);
			},
			//保存搜索历史记录
			saveHistory() {
				saveSearchHistory(this.chooseCityList).then(res => {
					this.getHistoryList();
					uni.$emit("updateHistory");
				});
			},
			//搜索此区域的人
			citiesSearch() {
				uni.removeStorageSync("filterParameters");
				this.saveHistory();
				uni.navigateTo({
					url: "../searchList/searchList?from=search&recommend=true"
				});
			},
			//更新当前位置信息
			updateCurrentLocation() {
				const {
					place_id,
					city,
					province,
					fullCity
				} = this.currentLocation;
				if (place_id && city && fullCity) {
					this.$set(this.locationObj, "place_id", place_id);
					this.$set(this.locationObj, "city", city);
					this.$set(this.locationObj, "province", province);
					this.$set(this.locationObj, "fullCity", fullCity);
				}
			}
		}
	};
</script>
<style lang="scss" src="../css/search.scss" scoped></style>
