const api = {
	login: '/oauth/token', //登录
	addCidHash: '/api-tools/fcm/addCidHash', //添加推送CID信息，userName：91Store  91Member
	sendRegisterCode: '/api-dancers/member/sendCode', //发送注册验证码
	loginOut: '/api-uaa/oauth/remove/token', //退出登录
	sendResetPwdCode: '/api-dancers/member/sendCode/resetPwd', //发送重置密码验证码
	resetPwd: '/api-dancers/member/resetPwd', //客户重置密码
	register: '/api-dancers/member/register', //客户注册 
	imgUpload: '/api-file/oss/imgUpload', //图片文件上传	
	videoUpload: '/api-file/oss/videoUpload', //视频文件上传
	updateUserInfo: '/api-member/member/updateMember', //修改用户信息
	userInfo: '/api-member/member/infoSimple', //当前用户信息
	orderList: '/api-dancers/order/labourOrders', //查询订单列表
	paymentPackageList: '/api-cms/durationSetMeals', //充值套餐时长列表
	memberList: '/api-member/member/members', //客户列表
	staffList: '/api-labour/employees', //员工列表
	memberInfo: '/api-member/member/infoSimpleVO', //客户用户详情
	staffInfo: '/api-labour/employee/', //员工详情
	evaluationStatistics: '/api-post/evaluation/label/statistics/', //评价标签统计
	evaluationCount: (merchandiseId) => `/api-post/evaluation/evaluation/count/${merchandiseId}`, //被评价数量
	evaluationList: (merchandiseId) => `/api-post/evaluation/evaluations/${merchandiseId}`, //被评价列表
	bustList: '/api-labour/busts', //胸围列表
	labelList: '/api-labour/labels', //标签列表
	serviceTypeList: '/api-labour/serves', //服务类型列表	
	figuresList: '/api-dancers/open/figures', //身材列表
	servicesList: '/api-labour/classifications',
	staffWorkTime: '/api-labour/workTimes/day', //工作时间可约时间段（按日期查询）（客户）
	staffWorkHour: '/api-dancers/workHours/member', //可预约时间列表（客户）
	employeeWorkHours: '/api-dancers/workHours', //员工工作时间查询(时间表显示)
	staffIsFollow: (employeeId) => `/api-post/employeeFollow/${employeeId}/isFollow`, //是否关注员工
	followStaff: (storeId, employeeId) => `/api-dancers/employeeFollow/${storeId}/${employeeId}`, //关注员工
	unFollowStaff: (employeeId) => `/api-dancers/employeeFollow/${employeeId}`, //取消关注员工
	addOrder: '/api-dancers/order/placeOrder', //下单
	paymentDeposit: '/api-dancers/pay/bond/stripePayment', //充值定金
	rechargeDays: '/api-dancers/pay/rechargeDays/stripePayment', //购买时长套餐
	deleteOrder: '/api-order/labourOrder/', //删除订单
	followsStaffList: '/api-dancers/member/employeeFollows', //关注的员工列表
	followsRemindsList: '/api-post/employeeFollows', //关注提醒列表
	notificationsList: '/api-dancers/post/notifications', //提醒列表(订单提醒)
	noticeMessageList: '/api-post/message/messages', //公告列表
	bondRefund: '/api-member/bondRefund', // 押金退回申请
	orderDetails: '/api-dancers/order/labourOrder/', //订单详情
	customerRepentance: (orderId) => `/api-dancers/order/${orderId}/repent`, //客户反悔
	customerPutOff: (orderId) => `/api-dancers/order/${orderId}/putOff`, //客户推迟订单
	getCustomerPutOff: (orderId) => `/api-order/putOff/${orderId}`, //客户推迟订单查询
	customerArrivals: (orderId) => `/api-dancers/order/${orderId}/arrivals`, //客户已到达指定区域	
	evaluationLabelsList: '/api-post/evaluationLabels', //评价标签列表0: 客户 1: 员工
	orderEvaluationList: (orderId, type) => `/api-post/evaluation/label/${orderId}/${type}`, //订单评价列表,Type,1对客户的评价,2.对员工的评价	
	orderScoreByCustomer: '/api-dancers/order/evaluation/employee', //客户评价员工
	downloadStaffInfo: '/api-dancers/employeePdf/', //员工详情(导出pdf所需数据)
	downloadStaffProfile: (employeeld) => `/api-dancers/employee/${employeeld}/export`, //员工详情(导出png所需数据)
	configPhone: '/api-dancers/open/config/phone', // 联系电话查询
	configEmail: '/api-dancers/open/config/email', // 联系邮箱查询
	getBond: '/api-dancers/config/bond', // 堂食定金查询
	getBondOutCall: '/api-dancers/config/bondOutCall', // 外卖定金查询
	getAmounts: '/api-cms/rechargeAmounts', // 充值定金配置
	orderBegin: (orderId) => `/api-dancers/order/${orderId}/begin`, //开始工作
	orderInProgressCount: '/api-order/labourOrders/notFinished/count', // 当前预约数
	indexBannerList: '/api-cms/indexBanners', // 首页banner
	employeeSimple: (employeeId) => `/api-labour/employee/${employeeId}/simple/member`, // 员工简略信息
	employeePrice: '/api-labour/employee/priceAndMaxPrice', // 订单金额
	platformContactList: '/api-cms/platformContacts', //联系我们
	getRemindUnreadCount: '/api-post/remind/unread/count', //提醒未读数
	getNotificationUnreadCount: '/api-post/notification/notification/unread/count', //通知未读数
	remindRead: (remindId) => `/api-post/remind/${remindId}/read`, //提醒已读
	notificationRead: (notificationId) => `/api-post/notification/${notificationId}/read`, //提醒已读	
	batchRemindRead: "/api-post/remind/readList", //提醒批量已读
	batchNotificationRead: "/api-post/notification/readList", //通知批量已读
	deleteNotification: (notificationId) => `/api-post/notification/notification/${notificationId}`, //通知删除
	deleteRemind: (remindId) => `/api-post/remind/${remindId}`, //提醒删除	
	currentlyAvailable: '/api-dancers/config/currentlyAvailable', //首页当前可约图片查询
	accessoryPerson: '/api-dancers/config/accessoryPerson', //首页附近的人图片查询
	employeeFollowsMember: '/api-post/employeeFollows/memberId', //关注的员工
	queryEmployee: '/api-elasticsearch/dancer/queryEmployee', //条件搜索员工
	queryByOrderConformity: "/api-elasticsearch/dancer/queryByOrderConformity", //搜索员工排序
	getVersion: "/api-dancers/open/edition/new", //查询版本
}
export default api
