//开发环境
// const baseUrl = "http://47.74.89.168:8081";
// const baseUrl = "http://47.74.87.19:8081";
// const socketUrl = "ws://47.74.89.232:3000";
// const socketUrl = "ws://172.29.92.27:3000";

//正式环境
const baseUrl = "https://api.91uber.co";
const socketUrl = "wss://socket.91uber.co";

const courtConfig = {
	baseUrl: baseUrl, //请求接口
	webSocketUrl: socketUrl, //webSocket
	grantType: 'member_phone_number', //登录grant_type
	// authorization: 'Basic RGFuY2VyczpEYW5jZXJzQWRtaW4=', //(Review，develop)登录Authorization
	// authNumber: 'aa8243990fb1123ff5e1336c5eda4', //(Review，develop)发送验证码number
	authorization: 'Basic RGFuY2VyczI6RGFuY2Vyc0FkbWlu', //(production)登录Authorization
	authNumber: 'aa8243990fbadawf5e1336c5eda4', //(production)发送验证码number
	googleMapAPIKey: "AIzaSyCBSqawIlmE8li02WnoR-XY1gkNjFRkWB4", //谷歌地图Key
	placeAutocompleteAPI: "https://maps.googleapis.com/maps/api/place/autocomplete/json", //谷歌地图地点自动完成API
	geocodeAPI:"https://maps.googleapis.com/maps/api/geocode/json",//谷歌地图地理位置信息API
	//phoneRegular: /^(\+?61|0)4\d{8}$/, //手机号验证正则表达式，验证如 +61412345678 或 61412345678 或 0412345678 均合法
	phoneRegular: /^4\d{8}$/, //手机号验证正则表达式，4开头，后面8位
	mailRegular: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, //邮箱验证正则表达式
	passwordRegular: /^[a-zA-Z0-9]{6,16}$/, //密码验证正则表达式，6-16，字母，数字，字母+数字
	validcodeRegular: /^\d{6}$/, //验证码（6位数字）
	tokenRefreshTime: 7200000,   //token刷新时间2小时，单位毫秒，
};
export default courtConfig;
