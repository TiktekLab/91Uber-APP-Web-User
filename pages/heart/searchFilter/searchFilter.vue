<template>
	<view class="bodyMain bodyBG hideScroll" style="overflow: auto;">
		<!-- 搜索框 -->
		<view class="header">
			<view class="status_bar"></view>
			<view class="searchBox padding flex-space-between">
				<view class="searchIconBox flex-center"><text class="iconfont searchIcon">&#xe60a;</text></view>
				<view class="centent">
					<input class="input"
						placeholder-style="color: #B4B4B4; fontSize: 24rpx;font-family: PingFangSCRegular;"
						v-model="filterParameters.username"
						placeholder="可以直接输入员工名称进行搜索"
					/>
				</view>
				<text class="flex-end cancel" @click="goHome">取消</text>
			</view>
		</view>
		<!-- 清空筛选条件 -->
		<view class="resetFilters padding flex-space-between">
			<view v-if="searchCities.length > 0" class="addressList flex hideScroll">
				<text class="item flex-center">{{ searchCities[0].fullCityLabel }}</text>
				<text v-if="searchCities.length > 1" class="more flex-center">& 2 more</text>
			</view>
			<text v-else></text>
			<!-- 占位符、别删 -->
			<text @click="resetFilters" class="resetBtn flex-center">清空筛选条件</text>
		</view>
		<!-- 分段器 -->
		<view class="padding subSection">
			<u-subsection :list="filterClass" :current="filterCurrent" @change="index => sectionChange(index, 1)" font-size="24rpx" bg-color="rgba(0,0,0,.1)" />
		</view>
		<view class="main padding">
			<view class="listItem  flex type">
				<text class="itemTitle ">类型</text>
				<view class="itemContent flex">
					<view :class="['typeItem', 'flex-center', { active: typesAll }]" @click="typesAllSelect()">
						<view class="box">
							<image v-if="typesAll" class="activeIcon" src="@/static/icon/isActive.png" mode="aspectFill" />
							<view class="typeIcon flex-center all"><text>All</text></view>
						</view>
						<text class="typeName">全部类型</text>
					</view>
					<view :class="['typeItem', 'flex-center', { active: item.checked }]" v-for="(item, index) in typesList" :key="item.id" @click="typesSelect(item)">
						<view class="box">
							<image v-if="item.checked" class="activeIcon" src="@/static/icon/isActive.png" mode="aspectFill" />
							<view class="typeIcon flex-center "><text class="iconfont icon" v-html="item.icon"></text></view>
						</view>
						<text class="typeName">{{ item.content }}</text>
					</view>
				</view>
			</view>
			<view class="listItem  flex ">
				<text class="itemTitle ">收费标准</text>
				<view class="itemContent flex">
					<slider-range
						ref="sliderPrice"
						:value="moneyValue"
						:min="10"
						:max="2000"
						sliderType="/h"
						:isMoney="true"
						@change="e => sliderChange('charge', e)"
						active-color="#992F65"
						background-color="#eee"
						blockColor="#FFF"
					/>
				</view>
			</view>
			<view class="listItem  flex ">
				<text class="itemTitle ">年龄</text>
				<view class="itemContent flex">
					<slider-range
						ref="sliderAge"
						:value="ageValue"
						:min="18"
						:max="80"
						sliderType="岁"
						@change="e => sliderChange('age', e)"
						active-color="#992F65"
						background-color="#eee"
						blockColor="#FFF"
					/>
				</view>
			</view>
			<view class="listItem  flex ">
				<text class="itemTitle ">身高</text>
				<view class="itemContent flex">
					<slider-range
						ref="sliderHeight"
						:value="heightValue"
						:min="140"
						:max="200"
						sliderType="cm"
						@change="e => sliderChange('height', e)"
						active-color="#992F65"
						background-color="#eee"
						blockColor="#FFF"
					/>
				</view>
			</view>
			<view class="listItem  flex ">
				<text class="itemTitle ">体重</text>
				<view class="itemContent flex">
					<slider-range
						ref="sliderWeight"
						:value="weightValue"
						:min="30"
						:max="100"
						sliderType="kg"
						@change="e => sliderChange('weight', e)"
						active-color="#992F65"
						background-color="#eee"
						blockColor="#FFF"
					/>
				</view>
			</view>
			<!-- 等级 -->
			<view class="listItem  flex bustBox">
				<text class="itemTitle ">等级（多选）</text>
				<view class="itemContent flex m-radius ">
					<!-- 选中状态添加：active 样式 -->
					<view :class="['bust', 'all', 'flex-center', { active: bustAll }]" @click="bustAllSelect()"><text>All</text></view>
					<view class="flex list hideScroll">
						<view :class="['bust', 'flex-center', { active: item.checked }]" @click="bustSelect(item)" v-for="(item, index) in bustList" :key="index">
							<text>{{ item.content }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="listItem  flex tagBox">
				<text class="itemTitle ">标签（多选）</text>
				<view class="itemContent flex">
					<view :class="['tag', 'flex-center', { active: item.checked }]" v-for="(item, index) in labelArray" :key="index" @click="tabClick(item)">
						<text class="flex-center">{{ item.content }}</text>
					</view>
				</view>
			</view>
			<view class="listItem  flex tagBox">
				<text class="itemTitle ">兴趣爱好（多选）</text>
				<view class="itemContent flex">
					<view :class="['tag', 'flex-center', { active: item.checked }]" v-for="(item, index) in serviceList" :key="index" @click="tabClick(item)">
						<text class="flex-center">{{ item.content }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="padding subSection sex">
			<u-subsection :list="sexList" :current="sexCurrent" @change="index => sectionChange(index, 2)" font-size="24rpx" bg-color="rgba(0,0,0,.1)" />
		</view>
		<view :class="['PreciseSearch absoluteBtn padding ', { isAndroid: isAndroid }]">
			<u-button hover-class="none" plain class="searchBtn  pink  m-btn" @click="confirmFilter"><text class="flex-center iconfont search">&#xe60a;</text></u-button>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import sliderRange from "@/component/slider-range/index.vue";
export default {
	components: {
		sliderRange
	},
	data() {
		return {
			filterClass: [
				{
					name: "堂食"
				},
				{
					name: "外卖 Outcall"
				},
				{
					name: "都可以"
				}
			],
			filterCurrent: 2,
			ageValue: [18, 80], // 年龄区间
			weightValue: [30, 100], // 体重区间
			moneyValue: [10, 2000], // 收费标准区间
			heightValue: [140, 200], //身高区间
			sexList: [
				{
					value: 2,
					name: "女"
				},
				{
					value: 1,
					name: "男"
				}
			],
			sexCurrent: 0,
			pageInfo: {
				pageNum: 1,
				pageSize: 100
			},
			bustList: [], // 等级列表
			serviceList: [], // 服务列表
			labelArray: [], // 标签列表
			filterParameters: {
				//搜索条件
				username: undefined, // 按人名搜索
				priceType: undefined, //0.堂食，1.外卖，2.全部
				labelList: undefined, //标签列表
				serveList: undefined, //服务列表
				bustIdList: undefined, // 等级列表
				ageStart: undefined,
				ageEnd: undefined,
				weightStart: undefined,
				weightEnd: undefined,
				priceStart: undefined,
				priceEnd: undefined,
				gender: undefined,
				heightStart: undefined,
				heightEnd: undefined,
				classificationIdList: undefined
			},
			typesList: [],
			typesAll: false,
			bustAll: true,
			categoryId: undefined
		};
	},
	onLoad(options) {
		this.categoryId = options.categoryId;
		this.getAttributeData();
		this.setIntervalValue();
		this.typesAll = this.categoryId ? false : true;
		this.typesList = this.staffCategory.map(item => {
			return {
				...item,
				checked: item.id === this.categoryId
			};
		});
	},
	computed: {
		...mapState({
			staffCategory: state => state.staffCategory,
			searchCities: state => state.searchCities
		})
	},
	methods: {
		...mapMutations(["setSearchCities"]),
		goHome() {
			uni.switchTab({
				url: "../heart"
			});
		},
		setIntervalValue() {
			//设置年龄，体重，价格区间值
			this.filterParameters.ageStart = this.ageValue[0];
			this.filterParameters.ageEnd = this.ageValue[1];
			this.filterParameters.weightStart = this.weightValue[0];
			this.filterParameters.weightEnd = this.weightValue[1];
			this.filterParameters.priceStart = this.moneyValue[0];
			this.filterParameters.priceEnd = this.moneyValue[1];
			this.filterParameters.heightStart = this.heightValue[0];
			this.filterParameters.heightEnd = this.heightValue[1];
		},
		async resetFilters() {
			this.filterCurrent = 2;
			this.sexCurrent = 0;
			this.bustAll = true;
			//重置types
			// this.typesAll = this.categoryId ? false : true;
			// if (this.categoryId) {
			// 	this.typesList.find(item => item.id === this.categoryId).checked = true;
			// 	this.typesList.filter(item => item.id !== this.categoryId && item.checked).map(item => {
			// 		item.checked = false
			// 	})
			// } else {
			// 	this.typesList.filter(item => item.checked).map(item => {
			// 		item.checked = false
			// 	})
			// }
			this.typesAll = true;
			this.typesList.filter(item => item.checked).map(item => { item.checked = false; });
			//重置搜索条件
			Object.keys(this.filterParameters).map(item => {
				this.filterParameters[item] = undefined;
			});
			this.labelArray.map(item => {
				item.checked = false;
			});
			this.serviceList.map(item => {
				item.checked = false;
			});
			this.bustList.map(item => {
				item.checked = false;
			});
			this.$refs.sliderAge._updateValue(this.ageValue);
			this.$refs.sliderWeight._updateValue(this.weightValue);
			this.$refs.sliderPrice._updateValue(this.moneyValue);
			this.$refs.sliderHeight._updateValue(this.heightValue);
			await this.setIntervalValue();
			this.$u.toast("筛选条件重置完成");
		},
		sliderChange(type, e) {
			if (type === "age") {
				//年龄
				this.filterParameters.ageStart = e[0];
				this.filterParameters.ageEnd = e[1];
			} else if (type === "weight") {
				//体重
				this.filterParameters.weightStart = e[0];
				this.filterParameters.weightEnd = e[1];
			} else if (type === "charge") {
				//收费标准
				this.filterParameters.priceStart = e[0];
				this.filterParameters.priceEnd = e[1];
			} else if (type === "height") {
				this.filterParameters.heightStart = e[0];
				this.filterParameters.heightEnd = e[1];
			}
		},
		confirmFilter() {
			this.setValue();
			uni.setStorageSync("filterParameters", this.filterParameters);
			uni.navigateTo({
				url: "../searchList/searchList?from=searchFilter&recommend=true"
			});
		},
		tabClick(item) {
			//标签，服务项目点击
			this.$set(item, "checked", !item.checked);
		},
		setValue() {
			//价格类型
			this.filterParameters.priceType = this.filterCurrent;
			//性别
			this.filterParameters.gender = this.sexCurrent === 0 ? 2 : 1;
			//设置types
			const types = this.typesList.filter(t => t.checked);
			if (types.length) {
				this.filterParameters.classificationIdList = types.map(item => {
					return item.id;
				});
			} else {
				this.filterParameters.classificationIdList = undefined;
			}
			//设置标签值
			let checkedLabels = this.labelArray.filter(t => t.checked);
			if (checkedLabels.length) {
				this.filterParameters.labelList = checkedLabels.map(item => {
					return item.id;
				});
			} else {
				this.filterParameters.labelList = undefined;
			}
			//设置服务内容值
			let checkedServers = this.serviceList.filter(t => t.checked);
			if (checkedServers.length) {
				this.filterParameters.serveList = checkedServers.map(item => {
					return item.id;
				});
			} else {
				this.filterParameters.serveList = undefined;
			}
			// 设置等级
			let checkedBusts = this.bustList.filter(t => t.checked);
			if (checkedBusts.length) {
				this.filterParameters.bustIdList = checkedBusts.map(item => {
					return item.id;
				});
			} else {
				this.filterParameters.bustIdList = undefined;
			}
		},
		getAttributeData() {
			//等级
			this.$http.get(this.$api.bustList, this.pageInfo).then(res => {
				this.bustList = res.list.map(item => {
					return {
						...item,
						checked: false
					};
				});
			});
			//服务类型
			this.$http.get(this.$api.serviceTypeList, this.pageInfo).then(res => {
				this.serviceList = res.list.map(item => {
					return {
						...item,
						checked: false
					};
				});
			});
			//标签
			this.$http.get(this.$api.labelList, this.pageInfo).then(res => {
				this.labelArray = res.list.map(item => {
					return {
						...item,
						checked: false
					};
				});
			});
		},
		typesAllSelect() {
			if (!this.typesAll) {
				this.typesAll = true;
				this.typesList.filter(item => item.checked).map(item => { item.checked = false; });
			}
		},
		typesSelect(obj) {
			obj.checked = !obj.checked;
			this.typesAll = this.typesList.every(item => !item.checked);
		},
		bustAllSelect() {
			if (!this.bustAll) {
				this.bustAll = true;
				this.bustList.filter(item => item.checked).map(item => { item.checked = false; });
			}
		},
		bustSelect(obj) {
			obj.checked = !obj.checked;
			this.bustAll = this.bustList.every(item => !item.checked);
		},
		sectionChange(index, type) {
			if (type === 1) {
				this.filterCurrent = index;
			} else if (type === 2) {
				this.sexCurrent = index;
			}
		}
	},
	onUnload() {
		this.setSearchCities([]);
	}
};
</script>

<style lang="scss" src="../css/searchFilter.scss" scoped></style>
