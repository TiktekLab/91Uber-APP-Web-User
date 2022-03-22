<template>
	<view class="bodyMain">
		<u-navbar :title="pageTitle" :border-bottom="false"  title-width="400"/>
		<view class="timePickerBox">
			<u-tabs :list="indexList" name="key" active-color="#000" bar-width="60" :current="currenTabs" @change="chagneTabs" class="tabs" />
			<u-checkbox-group class="scrollBox flex" active-color="#992F65" @change="checkboxGroupChange">
				<view class="timeItem" v-for="(item, index) in timeList" :key="index">
					<view class="timeTitle padding flex-start" :id="item.title">
						<text>{{ item.key }}</text>
					</view>
					<u-checkbox v-model="it.checked" v-for="(it, index1) in item.children" :name="`${index},${index1}`" :key="index1 + 100" :disabled="it.disable"
						:class="[{ active: it.checked }, { disable: it.disable }, 'timeList padding60 flex-space-between']">
						{{ it.time }}
					</u-checkbox>
				</view>
			</u-checkbox-group>
		</view>
		<view :class="['footerBtn padding flex', { isAndroid: isAndroid }]">
			<view class="left">
				<view class="flex-start priceBox">
					<text class="allPrice">总价：</text>
					<text class="money">{{ formatPrice(employeePrice.amt) }}</text>
				</view>
				<!-- <view v-if="employeePrice.amtMax" class="flex-start priceBox">
					<text class="allPrice"></text>
					<text class="gray">{{ formatPrice(employeePrice.amtMax) }}</text>
				</view> -->
				<text v-if="disabledBtn" class="warn">{{ disabledInfo }}</text>
			</view>
			<view class="right">
				<u-button hover-class="none" @click="confirm" :disabled="disabledBtn" size="medium" plain
					:class="['confirm pink  m-btn', { disable: disabledBtn }]">
					确定预约
				</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import moment from "moment";
	export default {
		onLoad(option) {
			this.orderType = decodeURIComponent(option.orderType);
			this.staffId = decodeURIComponent(option.staffId);
			this.minute = decodeURIComponent(option.minute);
			this.getIndexList();
			this.getWorkHourList();
		},
		onReady() {
			uni.$on("updateStaffTime", () => {
				this.getWorkHourList();
			})			
		},
		onPageScroll(e) {
			this.nodeInfo.map((item, index) => {
				if (e.scrollTop >= item.top - 130) {
					this.currenTabs = index;
				}
			});
		},
		data() {
			return {
				orderType: undefined, // 订单类型
				staffId: undefined,
				minute: undefined,
				employeePrice: {
					minutePick: undefined,
					minute: undefined,
					price: undefined,
					amt: undefined,
					amtMax: undefined,
					startTime: undefined,
					endTime: undefined
				},
				disabledBtn: true, // 是否禁用确定预约按钮
				disabledInfo: '选择未满最小时间',
				nodeInfo: [], // 节点信息
				currenTabs: 0, // 当前选中的tabs
				indexList: [],
				timeList: [],
			};
		},
		methods: {
			chagneTabs(e) {	
				this.currenTabs = e;	
				let curNode = this.nodeInfo.find(item => item.id === this.indexList[e].name);
				if(curNode) {
					uni.pageScrollTo({
						scrollTop: curNode.top - 110,
						duration: 100
					});	
				}		
			},
			getIndexList() {
				this.indexList = []; // tabs
				this.timeList = [];
				for (var i = 0; i < 7; i++) {
					const getDate = moment().locale('zh-cn').add(i, 'd');
					const key = moment().locale('zh-cn').add(i, "d").format("ddd D号");
					const title = 'd' + getDate.format("YYYYMMDD");
					this.indexList.push({
						name: title,
						key: key
					})
					this.timeList.push({
						day: getDate.format("YYYY-MM-DD"),
						title: title,
						key: key,
						children: []
					})
				}
			},
			getWorkHourList() {
				this.$http.get(this.$api.employeeWorkHours, {
						employeeId: this.staffId
					}).then(res => {						
						//console.log('时间列表', res.list);
						const allTimeList = res.list;
						if (allTimeList.length > 0) {
							this.timeList.map(item => {
								const queryTimeList = allTimeList.filter(q => q.startTime.includes(item.day));
								if (queryTimeList.length > 0) {
									const timeSlotsAll = this.getTimeSlotList(queryTimeList);
									const timeSlotsBooked = this.getActiveSlots(timeSlotsAll, queryTimeList);
									const timeSlotsDisabled = this.getDisableSlots(timeSlotsBooked,	queryTimeList);
									item.children.splice(0, item.children.length, ...timeSlotsDisabled);
								} else {
									item.children.splice(0, item.children.length);
								}
							})	
							setTimeout(()=> {
								this.getNodeInfo();
							}, 1500);
						}
					});
			},
			//拆分时间段
			getTimeSlotList(timeList) {
				const timeSlotList = [];
				timeList.map(time => {
					let startTime = moment(time.startTime);
					let endTime = moment(time.endTime);
					//时间段列表
					while (moment(startTime).isBefore(moment(endTime))) {
						const middleTime = moment(startTime).add(30, 'm').format();
						const item = {
							time: moment(startTime).format('HH:mm') + '-' + moment(middleTime).format('HH:mm'),
							startLabel: moment(startTime).format('HH:mm'),
							endLabel: moment(middleTime).format('HH:mm'),
							checked: false,
							disable: false,
							startTime: false,
							endTime: false,
							workTimeId: null,
							sortTime: moment(startTime).format(),
							checkStartTime: moment(startTime).format(),
							checkEndTime: moment(middleTime).format()
						}
						timeSlotList.push(item);
						startTime = middleTime;
					}
				})
				//升序排序
				timeSlotList.sort(function(pre, next) {
					if (moment(pre.sortTime).isBefore(moment(next.sortTime))) {
						return -1;
					} else {
						return 1;
					}
				})
				return timeSlotList;
			},
			//已预约时间段
			getActiveSlots(timeSlots, timeList) {
				timeList.filter(item => item.type === 1).map(item => {
					const start = moment(item.startTime).format('HH:mm');
					const end = moment(item.endTime).format('HH:mm');
					const startIndex = timeSlots.findIndex(t => t.startLabel === start);
					const endIndex = timeSlots.findIndex(t => t.endLabel === end);
					for (let i = startIndex; i <= endIndex; i++) {
						//已预约时间段也禁用
						//timeSlots[i].checked = true;
						//timeSlots[i].workTimeId = item.id;
						timeSlots[i].disable = true;
					}
					// timeSlots[startIndex].startTime = true;
					// timeSlots[endIndex].endTime = true;
				})
				return timeSlots;
			},
			//已禁用时间段
			getDisableSlots(timeSlots, timeList) {
				timeList.filter(item => item.type === 2).map(item => {
					const start = moment(item.startTime).format('HH:mm');
					const end = moment(item.endTime).format('HH:mm');
					const startIndex = timeSlots.findIndex(t => t.startLabel === start);
					const endIndex = timeSlots.findIndex(t => t.endLabel === end);
					for (let i = startIndex; i <= endIndex; i++) {
						timeSlots[i].disable = true;
					}
				})
				return timeSlots;
			},
			getNodeInfo() {
				this.nodeInfo.splice(0, this.nodeInfo.length);
				this.timeList.map(item => {
					uni.createSelectorQuery().select("#" + item.title).boundingClientRect(data => {							
							this.nodeInfo.push({
								top: data.top,
								id: data.id
							});
						}).exec();
				})
			},
			checkboxGroupChange(e) {
				if (e.length === 0) {
					this.disabledBtn = true;
					this.disabledInfo = '选择未满最小时间'
					return;
				}
				// console.log('选择的时间段：', e);
				const [index, index1] = e[0].split(",");
				let workHour = this.timeList[index].children[index1];
				let minuteNow = 30;
				let startTime = moment(workHour.checkStartTime);
				let lastEndTime = workHour.checkEndTime;
				for (var i = 1; i < e.length; i++) {
					const [first, second] = e[i].split(",");
					let workHour = this.timeList[first].children[second];
					if (moment(lastEndTime).isSame(moment(workHour.checkStartTime))) {
						minuteNow += 30;
						lastEndTime = workHour.checkEndTime;
					} else {
						minuteNow = 0;
						this.disabledBtn = true;
						this.disabledInfo = '时间不可以跳着选择';
						return
						break;
					}
				}
				if (minuteNow >= this.minute) {
					const param = {
						employeeId: this.staffId,
						type: this.orderType,
						minute: minuteNow
					};
					this.$http.get(this.$api.employeePrice, param).then(res => {
						this.employeePrice = res.employeePrice;
						//console.log('拿到的时间段：',res.employeePrice);
						this.employeePrice.startTime = moment(startTime).format("YYYY-MM-DD HH:mm:ss") ;
						this.employeePrice.endTime = moment(lastEndTime).format("YYYY-MM-DD HH:mm:ss");
						this.employeePrice.minutePick = minuteNow;
						this.disabledBtn = false;
					});
				} else {
					this.employeePrice = {};
					this.disabledBtn = true;
					this.disabledInfo = '选择未满最小时间'
				}
			},
			confirm() {
				// 确定预约
				uni.redirectTo({
					url: "../bookingDetails/bookingDetails?orderType=" +
						encodeURIComponent(this.orderType) +
						"&staffId=" +
						this.staffId +
						"&employeePrice=" +
						JSON.stringify(this.employeePrice),
					success() {
						this.disabledBtn = true;
					}
				});
			}
		},
		computed: {
			pageTitle() {
				if (Number(this.orderType) === 0) {
					return "堂食-选择时间段";
				}
				return "外卖 Outcall-选择时间段";
			},
			formatDate() {
				return time => {
					if (time) {
						return moment(time.replace("T", " ")).locale('zh-cn').format("dddD");
					}
					return "";
				};
			},
			formatTime() {
				return time => {
					if (time) {
						return moment(time.replace("T", " ")).format("HH:mm");
					}
					return "";
				};
			}
		},
		onUnload() {
			uni.$off("updateStaffTime")
		}
	};
</script>
<style lang="scss" scoped src="../css/timePicker.scss"></style>
