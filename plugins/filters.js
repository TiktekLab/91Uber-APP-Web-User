import moment from "moment";
export default {
	//时间格式：13:10/12 Jun
	timeHmdm(time) {
		if (time) return moment(time.replace('T', ' ')).locale('zh-cn').format('HH:mm/Do MMM');
		return null;
	},
	scoreFormat(score) {
		if(score && score !== "null"){
			const a = '' + score;
			const i = a.indexOf('.');
			if (i === -1) return a + '.00';
			if (i > 0) {
				const prefix = a.substr(0,i);
				const subfix = a.substr(i+1);
				if (subfix.length === 0) return prefix + '.00';
				if (subfix.length === 1) return prefix + '.' + subfix + '0';
				if (subfix.length === 2) return prefix + '.' + subfix;
				if (subfix.length > 2) return prefix + '.' + subfix.substr(0,2);				
			}
		}
		return '0';
	}
}
