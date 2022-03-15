const dbName = "pop"; //数据库名称

//打开数据库
//如果数据库存在则打开，不存在则创建。
export const openDb = () => {
	return new Promise((resolve, reject) => {
		plus.sqlite.openDatabase({
			name: dbName, //数据库名称
			path: `_doc/${dbName}.db`, //数据库地址
			success(e) {
				resolve(e);
			},
			fail(e) {
				reject(e);
			}
		})
	})
}

//判断数据库是否打开,数据库已经打开则返回true，数据库没有打开则返回false
export const isOpenDatabase = () => {
	return plus.sqlite.isOpenDatabase({
		name: dbName, //数据库名称
		path: `_doc/${dbName}.db` //数据库地址
	});
}

// 查询所有数据表名
export const getTable = () => {
	return new Promise((resolve, reject) => {
		plus.sqlite.selectSql({
			name: dbName,
			sql: "select * FROM sqlite_master where type='table'",
			success(e) {
				resolve(e);
			},
			fail(e) {
				console.log(e)
				reject(e);
			}
		})
	})
}

// 查询表数据总条数
export const getCount = (tabName, setWhere) => {
	let sql = "select count(*) as num from " + tabName;
	if (setWhere) {
		sql += ` where ${setWhere}`;
	}
	return new Promise((resolve, reject) => {
		plus.sqlite.selectSql({
			name: dbName,
			sql: sql,
			success(e) {
				resolve(e);
			},
			fail(e) {
				reject(e);
			}
		})
	})
}

// 查询表是否存在
export const isTable = (tabName) => {
	return new Promise((resolve, reject) => {
		plus.sqlite.selectSql({
			name: dbName,
			sql: `select count(*) as isTable FROM sqlite_master where type='table' and name='${tabName}'`,
			success(e) {
				resolve(e[0].isTable ? true : false);
			},
			fail(e) {
				console.log(e)
				reject(e);
			}
		})
	})
}

// 修改数据
export const updateSQL = (tabName, setStr, setWhere) => {
	if (setStr && setWhere) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: dbName,
				sql: `update ${tabName} set ${setStr} where ${setWhere}`,
				success(e) {
					resolve(e);
				},
				fail(e) {
					reject(e);
				}
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			reject("修改数据错误");
		});
	}
}

// 自定义修改数据（sql单条语句，多条传数组）
export const customUpdateSQL = (sql) => {
	if (sql && sql.length) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: dbName,
				sql: sql,
				success(e) {
					resolve(e);
				},
				fail(e) {
					reject(e);
				}
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			reject("修改数据错误");
		});
	}
}

//删除数据库数据
export const deleteTabItem = (tabName, setWhere) => {
	if (setWhere) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: dbName,
				sql: `delete from ${tabName} where ${setWhere}`,
				success(e) {
					resolve(e);
				},
				fail(e) {
					reject(e);
				}
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			reject("删除数据错误");
		});
	}
}

//关闭数据库
export const closeSQL = () => {
	return new Promise((resolve, reject) => {
		plus.sqlite.closeDatabase({
			name: dbName,
			success(e) {
				resolve(e);
			},
			fail(e) {
				reject(e);
			}
		})
	})
}

//监听数据库是否开启
export const isOpen = () => {
	let open = plus.sqlite.isOpenDatabase({
		name: dbName,
		path: `_doc/${dbName}.db`,
	})
	return open;
}

// 创建表，tabName不能用数字作为开头，列名加双引号
//"chat_i" INTEGER PRIMARY KEY AUTOINCREMENT,"local_id" TEXT NOT NULL UNIQUE,"id" TEXT,"chat_friend_id" TEXT,"content" INTEGER
export const addTab = (tabName, columsArr) => {
	let valColums = columsArr.join(",");
	return new Promise((resolve, reject) => {
		plus.sqlite.executeSql({
			name: dbName,
			sql: `create table if not exists ${tabName}(${valColums})`,
			success(e) {
				resolve(e);
			},
			fail(e) {
				console.log(e)
				reject(e);
			}
		})
	})
}

// 创建索引，colum多列组合索引用英文逗号隔开
export const addIndex = (indexName, tableName, colums) => {
	return new Promise((resolve, reject) => {
		plus.sqlite.executeSql({
			name: dbName,
			sql: `CREATE INDEX ${indexName} on ${tableName} (${colums})`,
			success(e) {
				resolve(e);
			},
			fail(e) {
				console.log(e)
				reject(e);
			}
		})
	})
}

//批量添加数据
export const batchAddTabItem = (tabName, arrayObj) => {
	if (arrayObj && arrayObj.length) {
		let keys = Object.keys(arrayObj[0]);
		let keyStr = keys.toString();
		let sqlArr = [];
		arrayObj.map(obj => {
			let valArr = keys.map(key => {
				return `'${obj[key]}'`
			})
			sqlArr.push(`insert into ${tabName}(${keyStr}) values(${valArr.toString()})`);
		})
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: dbName,
				sql: sqlArr,
				success(e) {
					resolve(e);
				},
				fail(e) {
					reject(e);
				}
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			reject("批量添加数据错误");
		})
	}
}

// 添加数据
export const addTabItem = (tabName, obj) => {
	if (obj) {
		let keys = Object.keys(obj);
		let keyStr = keys.toString();
		let valArr = keys.map(key => {
			return `'${obj[key]}'`
		});
		let sqlStr = `insert into ${tabName}(${keyStr}) values(${valArr.toString()})`;
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: dbName,
				sql: sqlStr,
				success(e) {
					resolve(e);
				},
				fail(e) {
					console.log(e)
					reject(e);
				}
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			reject("添加数据错误");
		})
	}
}

// 合并数据
export const mergeSql = (tabName, tabs) => {
	if (!tabs || tabs.length == 0) {
		return new Promise((resolve, reject) => {
			reject("错误");
		})
	}
	let itemValStr = ''
	tabs.forEach((item, index) => {
		let itemKey = Object.keys(item)
		let itemVal = ''
		itemKey.forEach((key, i) => {
			if (itemKey.length - 1 == i) {
				if (typeof item[key] == 'object') {
					itemVal += (`'${JSON.stringify(item[key])}'`)
				} else {
					itemVal += (`'${item[key]}'`)
				}
			} else {
				if (typeof item[key] == 'object') {
					itemVal += (`'${JSON.stringify(item[key])}',`)
				} else {
					itemVal += (`'${item[key]}',`)
				}
			}
		})
		if (tabs.length - 1 == index) {
			itemValStr += ('(' + itemVal + ')')
		} else {
			itemValStr += ('(' + itemVal + '),')
		}
	})
	let keys = Object.keys(tabs[0])
	let keyStr = keys.toString()
	return new Promise((resolve, reject) => {
		plus.sqlite.executeSql({
			name: dbName,
			sql: `insert or ignore into ${tabName} (${keyStr}) values ${itemValStr}`,
			success(e) {
				resolve(e);
			},
			fail(e) {
				console.log(e)
				reject(e);
			}
		})
	})
}

// 获取分页数据库数据
export const getDataList = async (tabName, num, size, setWhere, byName, byType) => {
	let count = 0;
	let sql = '';
	let numindex = 0;
	let totalCount = 0;
	await getCount(tabName, setWhere).then((resNum) => {
		totalCount = resNum[0].num;
		count = Math.ceil(totalCount / size);
	})
	if (((num - 1) * size) == 0) {
		numindex = 0;
	} else {
		numindex = ((num - 1) * size);
	}
	sql = `select * from ${tabName}`;
	if (setWhere) {
		sql += ` where ${setWhere}`;
	}
	if (byName && byType) {
		// desc asc
		sql += ` order by ${byName} ${byType}`;
	}
	sql += ` limit ${numindex},${size}`;
	if (count < num - 1) {
		return new Promise((resolve, reject) => {
			reject("无数据");
		});
	} else {
		selectDataList(tabName,setWhere,byName,byType);
		return new Promise((resolve, reject) => {
			plus.sqlite.selectSql({
				name: dbName,
				sql: sql,
				success(e) {
					resolve({
						list: e,
						count: totalCount
					});
				},
				fail(e) {
					console.log("error:", e);
					reject(e);
				}
			})
		})
	}
}

//查询数据库数据
export const selectDataList = (tabName, setWhere, byName, byType) => {
	let sql = ''
	if (setWhere) {
		sql = `select * from ${tabName} where ${setWhere}`
	} else {
		sql = `select * from ${tabName}`
	}
	if (byName && byType) {
		// desc asc
		sql += ` order by ${byName} ${byType}`
	}
	if (tabName !== undefined) {
		return new Promise((resolve, reject) => {
			plus.sqlite.selectSql({
				name: dbName,
				sql: sql,
				success(e) {
					resolve(e);
				},
				fail(e) {
					console.log(e)
					reject(e);
				}
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			reject("错误")
		});
	}
}
