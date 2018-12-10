var debug = utils.get("debug"); //debug模式
if(debug){
	require('./lib/vconsole.js');	
}
require('./lib/flexible.js');
var $ = require('jquery');
var Clipboard  = require('./lib/clipboard.js');
//引入css
require('./css/dltip.css');
import utils from './utils';

var container=  '<div class="container"></div>';
$(container).appendTo("#wonxAd_demo");

import api from './api/dltip.js';

var pid  = utils.get('pid');

var uid  = utils.get('uid');
var dltip = require('./tpl/dltip.tpl');
$(dltip({})).appendTo(".container");
api.getdownload({pid:pid,uid:uid}).then(function(data){
	if(data.data.data && data.data.data.downloadurl ){
		var dowloadurl = data.data.data.downloadurl;
		//剪切板
		var clipboard = new Clipboard('.btn_copy', {
		    text: function(trigger) {
		        return dowloadurl;
		    }
		});
		clipboard.on('success', function(e) {
		  alert("下载地址已复制到剪切板");
		});
	}	
});


