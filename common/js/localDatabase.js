import { isOpenDatabase, openDb, addTab, addIndex, getDataList, updateSQL, customUpdateSQL, deleteTabItem, getCount } from "@/plugins/sqlite.js";
import { getFollowsRemindsList, getNoticeList } from "./apiCommon.js";
import { updateFollowUnreadCount, updateNoticeUnreadCount, getLoginUserId } from "./storeCommon.js";


//关注提醒基本配置
const followConfig = {
	LastIdKey: "FollowId", //存储关注提醒Id
	TableName: "FollowMessages", //关注提醒表名
	TableColumns: [ //关注提醒表字段
		`"uId" INTEGER PRIMARY KEY AUTOINCREMENT`,
		`"loginId" INTEGER`, //当前登录用户Id
		`"id" INTEGER`,
		`"userId" INTEGER`,
		`"employeeId" INTEGER`,
		`"title" TEXT NULL`,
		`"type" INTEGER`,
		`"username" TEXT NULL`,
		`"avatar" TEXT NULL`,
		`"createTime" TEXT`,
		`"isRead" INTEGER`,
		`"ext1" TEXT NULL`,
		`"ext2" TEXT NULL`,
		`"ext3" TEXT NULL`,
		`"ext4" TEXT NULL`,
		`"ext5" TEXT NULL`,
		`UNIQUE(loginId,id)` //组合唯一约束
	]
}

//公告基本配置
const noticeConfig = {
	LastIdKey: "NoticeId", //存储公告Id
	TableName: "SysNotice", //公告表名
	TableColumns: [ //公告表字段
		`"uId" INTEGER PRIMARY KEY AUTOINCREMENT`,
		`"loginId" INTEGER`, //当前登录用户Id
		`"id" INTEGER`,
		`"userId" INTEGER`,
		`"receiveUserId" INTEGER NULL`,
		`"receiveUserType" INTEGER`,
		`"type" INTEGER`,
		`"scope" INTEGER`,
		`"template" TEXT NULL`,
		`"title" TEXT NULL`,
		`"description" TEXT NULL`,
		`"isDelete" INTEGER`,
		`"createTime" TEXT`,
		`"createId" INTEGER`,
		`"updateTime" TEXT NULL`,
		`"updateId"  TEXT NULL`,
		`"isRead" INTEGER`,
		`"ext1" TEXT NULL`,
		`"ext2" TEXT NULL`,
		`"ext3" TEXT NULL`,
		`"ext4" TEXT NULL`,
		`"ext5" TEXT NULL`,
		`UNIQUE(loginId,id)` //组合唯一约束
	]
}

//搜索历史配置
const placeHistoryConfig = {
	TableName: "SearchHistory", //搜索历史表名
	TableColumns: [ //搜索历史表字段
		`"id" INTEGER PRIMARY KEY AUTOINCREMENT`,
		`"place_id" TEXT NULL`,
		`"region" TEXT NULL`,
		`"province"  TEXT NULL`,
		`"city"  TEXT NULL`,
		`"street"  TEXT NULL`,
		`"postcode"  TEXT NULL`,
		`"lat"  TEXT NULL`,
		`"lng"  TEXT NULL`,
		`"loginId"  INTEGER`, //登录用户ID
		`"fullCity"  TEXT`, //搜索区域内容
		`"ext1" TEXT NULL`,
		`"ext2" TEXT NULL`,
		`"ext3" TEXT NULL`,
		`"ext4" TEXT NULL`,
		`"ext5" TEXT NULL`,
		`UNIQUE(loginId,fullCity)` //组合唯一约束
	]
}


//创建表(不存在则创建，存在直接返回成功)
const createTable = (data, tableName, tableColumns) => {
	return new Promise((resolve, reject) => {
		addTab(tableName, tableColumns).then(res => {
			resolve(data);
		}).catch(err => {
			reject(err);
		})
	})
}

//添加索引
const createIndex = (indexName, tableName, columns) => {
	const hasIndex = uni.getStorageSync(tableName);
	if(!hasIndex) {
		addIndex(indexName, tableName, columns).then(res => {
			uni.setStorageSync(tableName, "true");
		});
	}
}


//存储本地最后Id
const updateLastId = (lastId, lastIdKey, count) => {
	return new Promise((resolve, reject) => {
		uni.setStorage({
			key: lastIdKey,
			data: lastId,
			success() {
				resolve(count);
			},
			fail() {
				reject();
			}
		})
	})
}


//存储本数据
export const saveLocalData = (arr, tableName) => {
	if (arr && arr.length > 0) {
		//当前登录用户ID
		const currentUserId = getLoginUserId();
		const singleData = arr[0];
		const keys = Object.keys(singleData);
		const columns = keys.toString();
		let sql;
		if (arr.length > 1) {
			sql = [];
			arr.map(item => {
				const setData = keys.map(key => {
					return `'${item[key]}'`
				})
				sql.push(
					`insert or ignore into ${tableName}(${columns},loginId) values(${setData.toString()},${currentUserId})`
				);
			})
		} else {
			const setData = keys.map(key => {
				return `'${singleData[key]}'`
			})
			sql = `insert or ignore into ${tableName}(${columns},loginId) values(${setData.toString()},${currentUserId})`;
		}
		return new Promise((resolve, reject) => {
			customUpdateSQL(sql).then(res => {
				resolve(arr);
			}).catch(err => {
				reject(err);
			})
		});
	} else {
		return new Promise((resolve, reject) => {
			reject("缺少数据");
		})
	}
}

//初始添加本地数据表
const initDataTable = () => {
	addTab(followConfig.TableName, followConfig.TableColumns).catch(err => {
		console.log("addTab follow error", err);
	});
	addTab(noticeConfig.TableName, noticeConfig.TableColumns).catch(err => {
		console.log("addTab notice error", err);
	});
	addTab(placeHistoryConfig.TableName, placeHistoryConfig.TableColumns).catch(err => {
		console.log("addTab history error", err);
	});
}

//初始化本地数据存储信息
export const initLocalDB = () => {
	if (isOpenDatabase()) {
		initDataTable();
	} else {
		openDb().then(res => {
			initDataTable();
		}).catch(err => {
			console.log("Database open error", err);
		});
	}
}

//更新本地关注提醒数据
export const updateLocalFollow = () => {
	//当前登录用户ID
	const currentUserId = getLoginUserId();
	const followId = uni.getStorageSync(followConfig.LastIdKey + currentUserId) || "0";
	return new Promise((resolve, reject) => {
			getFollowsRemindsList({
				isPage: false,
				queryIdGt: followId,
				isPositiveOrder: true,
			}).then(res => {
				let list = res.list;
				const length = list.length;
				if (length > 0) {
					list.forEach(item => {
						item.isRead = 0;
					});
					resolve(list);
				} else {
					updateFollowUnreadCount();
					reject("no data");
				}
			})
		}).then(res => {
			//创建表
			return createTable(res, followConfig.TableName, followConfig.TableColumns);
		}).then(res => {
			//数据存储本地
			return saveLocalData(res, followConfig.TableName);
		}).then(res => {
			const count = res.length;
			return updateLastId(res[count - 1].id, followConfig.LastIdKey + currentUserId, count);
		}).then(res => {
			return new Promise((resolve, reject) => {
				updateFollowUnreadCount();
				resolve(res);
			})
		}).catch(err => {
			return new Promise((resolve, reject) => {
				reject(err);
			})
		})
}


//更新本地公告数据
export const updateLocalNotice = () => {
	//当前登录用户ID
	const currentUserId = getLoginUserId();
	const noticeId = uni.getStorageSync(noticeConfig.LastIdKey + currentUserId) || "0";
	return new Promise((resolve, reject) => {
			getNoticeList({
				receiveUserType: 1,
				isPage: false,
				queryIdGt: noticeId,
				isPositiveOrder: true,
			}).then(res => {
				let list = res.list;
				const length = list.length;
				if (length > 0) {
					list.forEach(item => {
						item.isDelete = item.isDelete ? 1 : 0;
						item.isRead = 0;
					});
					resolve(list);
				} else {
					updateNoticeUnreadCount();
					reject("no data");
				}
			})
		}).then(res => {
			//创建表
			return createTable(res, noticeConfig.TableName, noticeConfig.TableColumns);
		}).then(res => {
			//数据存储本地
			return saveLocalData(res, noticeConfig.TableName);
		}).then(res => {
			const count = res.length;
			return updateLastId(res[count - 1].id, noticeConfig.LastIdKey + currentUserId, count);
		}).then(res => {
			return new Promise((resolve, reject) => {
				updateNoticeUnreadCount();
				resolve(res);
			})
		}).catch(err => {
			return new Promise((resolve, reject) => {
				reject(err);
			})
		})
}


//查询本地关注提醒数据
export const getLocalFollowList = (num, size) => {
	//当前登录用户ID
	const currentUserId = getLoginUserId();
	return new Promise((resolve, reject) => {
		getDataList(followConfig.TableName, num, size, `loginId = ${currentUserId}`, "uId", "desc").then(
			res => {
				resolve(res);
			}).catch(err => {
			reject(err);
			// uni.showToast({
			// 	icon: "none",
			// 	title: '未获取到关注提醒数据'
			// });
		})
	})
}

//关注提醒标记为已读
export const readLocalFollow = (ids) => {
	if (ids && ids.length > 0) {
		let sql;
		if (ids.length > 1) {
			sql = [];
			ids.map(item => {
				sql.push(`update ${followConfig.TableName} set isRead = 1 where uId = ${item}`)
			})
		} else {
			sql = `update ${followConfig.TableName} set isRead = 1 where uId = ${ids[0]}`;
		}
		return new Promise((resolve, reject) => {
			customUpdateSQL(sql).then(res => {
				resolve(res);
			}).catch(err => {
				reject(err);
			})
		});
	} else {
		return new Promise((resolve, reject) => {
			reject("缺少修改数据");
		})
	}
}

//关注提醒删除
export const deleteLocalFollow = (id) => {
	return new Promise((resolve, reject) => {
		deleteTabItem(followConfig.TableName, `uId = ${id}`).then(res => {
			resolve(res);
		}).catch(err => {
			reject(err);
			uni.showToast({
				icon: "none",
				title: '删除失败'
			});
		})
	});
}

//查询关注提醒未读数量
export const getFollowUnReadCount = () => {
	//当前登录用户ID
	const currentUserId = getLoginUserId();
	return new Promise((resolve, reject) => {
		getCount(followConfig.TableName, `isRead = 0 and loginId = ${currentUserId}`).then((resNum) => {
			resolve(resNum[0].num);
		}).catch(err => {
			reject(err);
		})
	});
}

//查询本地公告数据
export const getLocalNoticeList = (num, size) => {
	//当前登录用户ID
	const currentUserId = getLoginUserId();
	return new Promise((resolve, reject) => {
		getDataList(noticeConfig.TableName, num, size, `loginId = ${currentUserId}`, "uId", "desc").then(res => {
				resolve(res);
			}).catch(err => {
				reject(err);
				// uni.showToast({
				// 	icon: "none",
				// 	title: '未获取到公告数据'
				// });
			})
	})
}

//公告标记为已读
export const readLocalNotice = (id) => {
	return new Promise((resolve, reject) => {
		updateSQL(noticeConfig.TableName, "isRead = 1", `uId = ${id}`).then(res => {
			resolve(res);
		}).catch(err => {
			reject(err);
		})
	});
}

//公告删除
export const deleteLocalNotice = (id) => {
	return new Promise((resolve, reject) => {
		deleteTabItem(noticeConfig.TableName, `uId = ${id}`).then(res => {
			resolve(res);
		}).catch(err => {
			reject(err);
			uni.showToast({
				icon: "none",
				title: '删除失败'
			});
		})
	});
}

//查询公告未读数量
export const getNoticeUnReadCount = () => {
	//当前登录用户ID
	const currentUserId = getLoginUserId();
	return new Promise((resolve, reject) => {
		getCount(noticeConfig.TableName, `isRead = 0 and loginId = ${currentUserId}`).then((resNum) => {
			resolve(resNum[0].num);
		}).catch(err => {
			reject(err);
		})
	});
}


//存储搜索历史记录数据
export const saveSearchHistory = (arr) => {
	if (arr && arr.length > 0) {
		//当前登录用户ID
		const currentUserId = getLoginUserId();
		const singleData = arr[0];
		const keys = Object.keys(singleData).filter(item => !["loginId", "choose", "id", "type", "fullCityLabel"].includes(item));
		const columns = keys.toString();
		let sql;
		if (arr.length > 1) {
			sql = [];
			arr.map(item => {
				const setData = keys.map(key => {
					return `'${item[key]}'`
				})
				sql.push(
					`insert or ignore into ${placeHistoryConfig.TableName}(${columns},loginId) values(${setData.toString()},${currentUserId})`
				);
			})
		} else {
			const setData = keys.map(key => {
				return `'${singleData[key]}'`
			})
			sql =
				`insert or ignore into ${placeHistoryConfig.TableName}(${columns},loginId) values(${setData.toString()},${currentUserId})`;
		}

		return new Promise((resolve, reject) => {
			customUpdateSQL(sql).then(res => {
				resolve(res);
			}).catch(err => {
				reject(err);
			})
		});
	} else {
		return new Promise((resolve, reject) => {
			reject("缺少数据");
		})
	}
}

//查询搜索历史记录数据
export const getSearchHistoryList = (num, size) => {
	//当前登录用户ID
	const currentUserId = getLoginUserId();
	return new Promise((resolve, reject) => {
		getDataList(placeHistoryConfig.TableName, num, size, `loginId = ${currentUserId}`, "id", "desc")
			.then(res => {
				resolve(res);
			}).catch(err => {
				reject(err);
			})
	})
}

//删除搜索历史
export const deleteHistory = (id) => {
	return new Promise((resolve, reject) => {
		deleteTabItem(placeHistoryConfig.TableName, `id = ${id}`).then(res => {
			resolve(res);
		}).catch(err => {
			reject(err);
		})
	});
}
