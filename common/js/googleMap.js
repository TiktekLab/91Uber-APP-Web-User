import $base from './baseconfig.js';

//联想地址搜索默认配置
const placeAutocompleteConfig = {
	components: "country:au",
	language: "en-AU",
	types: "(cities)",
	key: $base.googleMapAPIKey
};

//根据经纬度搜索地址
const geocodeByLatlngConfig = {
	key: $base.googleMapAPIKey,
	language: "en-AU",
	result_type: "locality"
};

//获取API地址
const getApi = (url, obj) => {
	const keys = Object.keys(obj);
	let api = url + "?";
	const params = keys.map(key => {
		return `${key}=${obj[key]}`
	})
	return api += params.join("&");
}

//解析地址
const getAddress = (place_id, address_components) => {
	let postcode = "";
	let city = "";
	let province = "";
	let region = "";
	for (const component of address_components) {
		const componentType = component.types[0];
		switch (componentType) {
			case "postal_code": {
				postcode = component.short_name;
				break;
			}
			case "locality": //区(市)
				city = component.long_name;
				break;
			case "administrative_area_level_1": { //州
				province = component.short_name;
				break;
			}
			case "country": //region/country
				region = component.short_name;
				break;
		}
	}
	return {
		place_id: place_id,
		city: city,
		province: province,
		fullCity: `${city}, ${province}`,
		postcode
	}
}

//谷歌地图地点搜索自动完成
export const googleMapPlaceAutocomplete = (input) => {
	const url = getApi($base.placeAutocompleteAPI, {
		input: encodeURIComponent(input),
		...placeAutocompleteConfig
	});
	//console.log("googleMapPlaceAutocomplete", url);
	return new Promise((resolve, reject) => {
		uni.request({
			url: url,
			header: {},
			method: "GET",
			success: (res) => {
				const predictions = res.data.predictions;
				const resultList = predictions.map(item => {
					return {
						place_id: item.place_id,
						city: item.terms[0].value,
						province: item.terms[1].value,
						fullCity: `${item.terms[0].value}, ${item.terms[1].value}`,
						fullCityLabel: `${item.terms[0].value}, ${item.terms[1].value}`,
						choose: false,
						type: 1, //搜索建议
					}
				})
				resolve(resultList);
			},
			fail: (err) => {
				reject(err);
			}
		});
	})
}

//谷歌地图地理位置信息
export const googleMapGeocodeByLatlng = (lat, lng) => {
	const url = getApi($base.geocodeAPI, {
		latlng: `${lat},${lng}`,
		...geocodeByLatlngConfig
	});
	return new Promise((resolve, reject) => {
		uni.request({
			url: url,
			header: {},
			method: "GET",
			success: (res) => {
				//console.log("googleMapGeocodeByLatlng", res);
				if (res.data.status === "OK" && res.data.results.length > 0) {
					const {
						address_components,
						place_id
					} = res.data.results[0];
					const result = getAddress(place_id, address_components);
					resolve(result);
				} else {
					reject("error");
				}
			},
			fail: (err) => {
				reject(err);
			}
		});
	})
}
