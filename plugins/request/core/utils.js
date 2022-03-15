// 获取合并的数据
export const mergeConfig = function(_this, options) {
	//判断url是不是链接
	let urlType = /^(http|https):\/\//.test(options.url);
	let config = Object.assign({
		timeout: _this.timeout
	}, _this.config, options);
	if (options.method == "FILE") {
		config.url = urlType ? options.url : _this.fileUrl + options.url;
	} else {
		config.url = urlType ? options.url : _this.baseUrl + options.url;
	}
	//请求头
	if (options.header) {
		config.header = Object.assign({}, _this.header, options.header);
	} else {
		config.header = Object.assign({}, _this.header);
	}
	return config;
}

// 请求
export const dispatchRequest = function(requestInfo) {
	return new Promise((resolve, reject) => {
		let requestAbort = true;
		let requestData = {
			url: requestInfo.url,
			header: requestInfo.header, //加入请求头
			success: (res) => {
				requestAbort = false;
				resolve(res);
			},
			fail: (err) => {
				requestAbort = false;
				if(err.errMsg == "Request:fail abort"){
					reject({
						errMsg: "Request timed out, please try again",
						statusCode: 0,
					});
				} else {
					reject(err);
				}
			}
		};
		//请求类型
		if (requestInfo.method) {
			requestData.method = requestInfo.method;
		}
		if (requestInfo.data) {
			requestData.data = requestInfo.data;
		}
				
		if (requestInfo.dataType) {
			requestData.dataType = requestInfo.dataType;
		}
		
		if (requestInfo.responseType) {
			requestData.responseType = requestInfo.responseType;
		}		
		
		let requestTask = uni.request(requestData);
		setTimeout(() => {
			if(requestAbort){
				requestTask.abort();
			}
		}, requestInfo.timeout)
	})
}