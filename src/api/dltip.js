import axios from 'axios'

var host = "http://api.touchfa.com";

const api = {
	//获取下载链接
	getdownload:function(data) {
		var url = host + '/poster/getdownload';
		return axios.get(url,{params:data});
	}
}


export default api;