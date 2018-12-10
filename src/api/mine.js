import axios from 'axios'

var host = "http://api.touchfa.com";

const api = {
	//获取模板的详情
	posterlist:function(data) {
		var url = host + '/poster/posterlist';
		return axios.get(url,{params:data});
	},
	posterdelete:function(data){
		var url = host + '/poster/delete';
		return axios.get(url,{params:data});
	},
	createPay:function(data) {
		var url = host + '/wexin/pay/create';
		return axios.post(url,data);
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