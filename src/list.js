import utils from './utils';
var debug = utils.get("debug"); //debug模式
if(debug){
	require('./lib/vconsole.js');	
}
require('./lib/flexible.js');
var $ = require('jquery');

//引入css
require('./css/list.css');
import api from './api/list';
var openid = utils.get('openid');
var container=  '<div class="container"></div>';
$(container).appendTo("#wonxAd_demo");
var template = require('./tpl/listTemplate.tpl');
var page =1;
var lock = false;
var endPage = false;
function getlist(){
  var data = {
      page:page,
      nbr:10
  };
  if(lock || endPage){ return ;}
  lock = true;
  api.posterlist(data).then(function (data) {
      var data = data.data
      if(data.status != 0) {return;}
      endPage = data.data.end_page;
      var posterlist = data.data.posters;
      for(var i in posterlist){
        var item = posterlist[i];
        var data = {
          cover:item.cover,
          title:item.name,
          link:"./wonxVideo.html?mid="+item.model_id+"&type=model&openid=" + openid + ( debug?"&debug=1":"" )
        }
        $(template(data)).appendTo(".container");
      }
      if(!$(".container").html())$(".container").html('<div style="width:100%;text-align:center;">暂无海报，请先制作</div>')
      page++;
      lock = false;
  });
}
getlist();
$(window).scroll(function(){  
    var st = document.body.scrollTop *1;
    var dh = $(document).height() *1;
    var ch = document.body.clientHeight *1;
    if(dh <= st + ch + 1){
      getlist();
    }
});