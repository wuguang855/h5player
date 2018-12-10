import utils from './utils';
var debug = utils.get("debug"); //debug模式
if(debug){
	require('./lib/vconsole.js');	
}
require('./lib/flexible.js');
var $ = require('jquery');
//引入css
require('./css/home.css');
import api from './api/list';
var home = require('./tpl/home.tpl');
$(home({})).appendTo("#wonxAd_demo");