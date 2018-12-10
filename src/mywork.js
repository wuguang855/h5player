var debug = utils.get("debug"); //debug模式
if(debug){
	require('./lib/vconsole.js');	
}
require('./lib/flexible.js');
var $ = require('jquery');
//引入css
require('./css/mywork.css');
import utils from './utils';
import api from './api/mine';

Date.prototype.format = function(format) {
       var date = {
              "M+": this.getMonth() + 1,
              "d+": this.getDate(),
              "h+": this.getHours(),
              "m+": this.getMinutes(),
              "s+": this.getSeconds(),
              "q+": Math.floor((this.getMonth() + 3) / 3),
              "S+": this.getMilliseconds()
       };
       if (/(y+)/i.test(format)) {
              format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
       }
       for (var k in date) {
              if (new RegExp("(" + k + ")").test(format)) {
                     format = format.replace(RegExp.$1, RegExp.$1.length == 1
                            ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
              }
       }
       return format;
}


var tpl = require('./tpl/mywork.tpl');
var work_item = require('./tpl/workItem.tpl');

var openid = utils.get('openid');
var container=  '<div class="container"></div>';
$(container).appendTo("#wonxAd_demo");
$(tpl({})).appendTo(".container");

console.log(openid);

var page =1;
var lock = false;
var endPage = false;
var hasworks =false;
function getlist(){
  var data = {
      author:openid,
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
      if(posterlist.length>0){
        hasworks=true;
      }
      for(var i in posterlist){
        var item = posterlist[i];
        var data = {
          cover:item.share_image || item.cover,
          title:item.share_title || item.name,
          summary: item.share_summary || "",
          clicknum:item.clicknum,
          time:new Date(item.create_at * 1000).format('YYYY.MM.dd hh:mm'),
          wid:item.work_id,
          uid:openid,
          is_violation:item.is_violation,
          data:JSON.stringify(item)
        }
        $(work_item(data)).appendTo(".worklists");
      }
      page++;
      lock = false;

      if(hasworks){
        $(".noworkinfo").css("display","none");
        $(".nowork").css("display","none");
      }else{

      }
  });
}

getlist();

$(".worklists").scroll(function(){  
    var st = $(".worklists").get(0).scrollTop *1;
    var dh = $(".worklists").height() *1;
    var ch = document.body.clientWidth*2.8*(page-2);
    console.log(st,dh,ch);
    if(dh <= st + ch + 1){
      getlist();
    }
});

$("#wonxAd_demo").on("click",".op_set",function(e){
  e.stopPropagation();
    var wid = $(this).data("wid");
    console.log(wid);
    window.location.href = "./postierSetShare.html?openid="+openid+"&wid="+wid+ ( debug?"&debug=1":"");

});

$("#wonxAd_demo").on("click",".op_del",function(e){
  e.stopPropagation();
   var wid = $(this).data("wid");
  var myAlert = '<div class="myalertbox">'+
                  '<div class="myalert">'+
                  '<div class="content">确认删除？</div>'+
                   '<div class="confirm">确认</div>'+
                    '<div class="cancal">取消</div>'+
                    '</div>'+
                '</div>';
  $(myAlert).appendTo(".container");
  var thisdom = $(this).parents(".work_item");

  $(".myalert .confirm").one("click",function(){
    $(".myalertbox").remove();
    var posterdata = {
        pid:wid,
        author:openid
    }  
    api.posterdelete(posterdata).then(function(res){
      var data = res.data;
      console.log(data);
      if(data.status==0){
        thisdom.remove();
      }else{
        alert(data.errmsg);
      }
    })

  })
  $(".myalert .cancal").one("click",function(){
      $(".myalertbox").remove();
  });
});

$("#wonxAd_demo").on("click",".work_item",function(e){
  var wid = $(this).data("wid");
  var useable = $(this).data("useable");
  if(useable){
      window.location.href = "./wonxVideo.html?openid="+openid+"&wid="+wid+"&type=play"+( debug?"&debug=1":""); 
  }
});

var downtips = '<div id="downtips" style="position: fixed;display:none; top:40%;text-align: center;width:236px;height:28px;margin-left: calc(50% - 118px);opacity: 0.6;background: #000000;border-radius: 16px;font-size: 12px;color: #FFFFFF;letter-spacing: 0;line-height: 28px;"></div>';

$(downtips).appendTo("#wonxAd_demo");

$("#wonxAd_demo").on("click",".op_dl",function(e){
  e.stopPropagation();
    var useable = $(this).data("useable");
  if(useable){
   var workdata = $(this).data("item");
   var ispay = workdata.is_pay;
      var uid = $(this).data("uid");
   var pid = $(this).data("wid");
   if(ispay){
      api.download(workdata.work_id).then(function(res){
        console.log(res);

        api.getuserinfo(openid).then(function(data){
          console.log(openid);
          console.log(data);
          if(data.subscribe==0){alert("关注公众号才能下载");window.location.href="http://url.cn/5CJF8Gi";}
          else{
          $("#downtips").html("视频将在三分钟内通过公众号对话发送");
          document.getElementById("downtips").style.display = "block";
            window.setTimeout(function(){document.getElementById("downtips").style.display = "none";}, 3000);
          }
        });
      })
   }else{
      var isWx = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
      if(!isWx){
        $("#downtips").html("仅支持微信内置浏览器");
        document.getElementById("downtips").style.display = "block";
        window.setTimeout(function(){document.getElementById("downtips").style.display = "none";}, 3000);
      }else{
        var postData = {
          openid:openid,
          pid: workdata.work_id,
            total_fee: workdata.price,
            body: "商品描述"
        };
        api.createPay(postData).then(function(res){
          var appId = res.data.appId;
          var timeStamp = res.data.timeStamp;
          var nonceStr = res.data.nonceStr;
          var packageName = res.data.package;
          var sign = res.data.sign;

          function onBridgeReady(){
             WeixinJSBridge.invoke(
                 'getBrandWCPayRequest', {
                     "appId":appId,     //公众号名称，由商户传入     
                     "timeStamp":timeStamp,         //时间戳，自1970年以来的秒数     
                     "nonceStr":nonceStr, //随机串     
                     "package":packageName,     
                     "signType":"MD5",         //微信签名方式：     
                     "paySign":sign //微信签名 
                 }, 
                 function(res){
                    console.log("res",res);  
                     if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                        api.getuserinfo(openid).then(function(data){
                          console.log(openid);
                          console.log(data);
                          if(data.subscribe==0){alert("关注公众号才能下载");window.location.href="http://url.cn/5CJF8Gi";}
                          else{
                            $("#downtips").html("视频将在三分钟内通过公众号对话发送");
                            document.getElementById("downtips").style.display = "block";
                            window.setTimeout(function(){document.getElementById("downtips").style.display = "none";}, 3000);
                          }
                        });
                     }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
                 }
             ); 
          }
          if (typeof WeixinJSBridge == "undefined"){
             if( document.addEventListener ){
                 document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
             }else if (document.attachEvent){
                 document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
                 document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
             }
          }else{
             onBridgeReady();
          }
        }); 
      }
   }
 }
});

$("#wonxAd_demo").on("click",".btn_more,.btn",function(){
	window.location.href = "./postierList.html?openid="+openid;
})
$("#wonxAd_demo").on("click",".btn_more",function(){
  window.location.href = "https://mp.weixin.qq.com/s?__biz=MzI3NTg1ODk0MA==&mid=2247483688&idx=1&sn=367bc5d65b788aeeb25220b5b403401c&chksm=eb7f15bbdc089cad4a3daab0197e96c50c650f1c8e6db3cc71b3b8b4c158f2394bdd1b614e77#rd";
})


