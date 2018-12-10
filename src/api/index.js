import axios from 'axios'

var host = "http://api.touchfa.com";

const api = {
	//获取模板的详情
	postermodel:function(data) {
		var url = host + '/postermodel/getone';
		return axios.get(url,{params:data});
	},
	//获取作品详情
	poster:function(data) {
		var url = host + '/poster/getone';
		return axios.get(url,{params:data});
	},
	//添加点击次数
	addclicknum:function(data) {
		var url = host + '/poster/add_clicknum';
		return axios.get(url,{params:data});
	},
	createPay:function(data) {
		var url = host + '/wexin/pay/create';
		return axios.post(url,data);
	},
	download:function(wid){
		var url = host + '/poster/download/'+wid;
		return axios.get(url,{});
	},
	getuserinfo:function(openid){
		var url = host + '/weidong/getuserinfo?openid='+openid;
		return axios.get(url,{});
	}
	
}


export default api;