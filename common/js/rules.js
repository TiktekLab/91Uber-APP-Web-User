import vue from 'vue';
const rules = {
	name: [{
		required: true,
		message: '您还没有输入昵称',
		trigger: ['change', 'blur'],
	}],
	code: [{
			required: true,
			message: '请输入您的验证码',
			trigger: ['change', 'blur'],
		},
		{
			message: '验证码格式错误',
			pattern: vue.prototype.$base.validcodeRegular,
			trigger: ['change', 'blur'],
		},
	],
	phone: [{
			required: true,
			message: '请输入您的手机号',
			trigger: ['change', 'blur'],
		},
		{
			message: '手机号格式错误',
			pattern: vue.prototype.$base.phoneRegular,
			trigger: ['change', 'blur'],
		},
	],
	province: [{
		required: true,
		message: '请选择州',
		trigger: ['change', 'blur'],
	}, ],
	city: [{
		required: true,
		message: '请输入Suburb',
		trigger: ['change', 'blur'],
	}, ],
	email: [
		// {
		// 	required: true,
		// 	message: '请输入您的邮箱',
		// 	trigger: ['change', 'blur'],
		// },
		{
			message: '邮箱格式错误',
			pattern: vue.prototype.$base.mailRegular,
			trigger: ['change', 'blur'],
		},
	],
	pwd: [{
			required: true,
			message: '请输入您的密码',
			trigger: ['change', 'blur'],
		},
		{
			pattern: vue.prototype.$base.passwordRegular,
			message: '请至少输入6位密码字符，且只能包含字母或者数字',
			trigger: ['change', 'blur'],
		},
	],
	confirmPwd: [{
		required: true,
		message: '请重新输入密码',
		trigger: ['change', 'blur'],
	}],
	username: [{
			required: true,
			message: '请输入您的手机号',
			trigger: ['change', 'blur'],
		},
		{
			message: '手机号格式错误',
			pattern: vue.prototype.$base.phoneRegular,
			trigger: ['change', 'blur'],
		},
	],
	password: [{
			required: true,
			message: '请输入您的密码',
			trigger: ['change', 'blur'],
		},
		{
			pattern: vue.prototype.$base.passwordRegular,
			message: '请至少输入6位密码字符，且只能包含字母或者数字',
			trigger: ['change', 'blur'],
		},
	],
	roomNumber: [{
		required: true,
		message: '请输入房间号',
		trigger: ['change', 'blur'],
	}, ],
	address: [{
		required: true,
		message: '请输入Street Address',
		trigger: ['change', 'blur'],
	}, ],
	amount: [{
		required: true,
		message: '请输入返还金额',
		trigger: ['change', 'blur'],
	}, ],
	accountName: [{
		required: true,
		message: '请输入账户名',
		trigger: ['change', 'blur'],
	}, ],
	bsb: [{
		required: true,
		message: '请输入BSB',
		trigger: ['change', 'blur'],
	}, ],
	accountNumber: [{
		required: true,
		message: '请输入卡号',
		trigger: ['change', 'blur'],
	}, ],
}
module.exports = rules
