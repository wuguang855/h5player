import axios from 'axios'

var host = "http://api.touchfa.com";

const api = {
	//获取模板的详情
	getShareInfo:function(data) {
		var url = host + '/poster/getone';
		return axios.get(url,{params:data});
	},
	uploadToken:function(data) {
		var url = host + '/weiwork/upload_token';
		return axios.get(url,{params:data});
	},
	setShare:function(data) {
		var url = host + '/poster/share-config';
		return axios.post(url,data);
	}
};


export default api;