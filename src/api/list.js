import axios from 'axios'

var host = "http://api.touchfa.com";

const api = {
	//获取模板的详情
	posterlist:function(data) {
		var url = host + '/postermodel/modellist';
		return axios.get(url,{params:data});
	},
	
}


export default api;