import utils from './utils';
import api from './api';
import WonxAd from './wxvideo/wonxAd';

require('./css/main.css');
//获取作品id
var type = utils.get("type");  //页面类型
var wid= utils.get("wid"); //作品id
var pid= utils.get("pid"); //作品id
var openid = utils.get("openid"); //userid
var mid= utils.get("mid"); //模版id
var debug = utils.get("debug"); //debug模式
var isPay = false;
if(debug){
	require('./lib/vconsole.js');	
}
if(type!="model"){//如果不是模板
	//上报添加点击次数
	api.addclicknum({pid:pid||wid}).then(function(data){
		console.log(data);
	})
	//获取作品信息
	api.poster({pid:pid||wid}).then(function(data){
		var workdata = data.data.data.poster;
		if(debug){
			workdata = utils.debugData(workdata);
		}
		workdata.type = type;
		workdata.author = openid;
		var dom = document.getElementById("wonxAd_demo");
		if(type=="setshare"){
			
			console.log("workdata",workdata);

		var dh = document.body.clientHeight;
		var dw = document.body.clientWidth;
		var wh = workdata.height;
		var ww = workdata.width;
		var scale  = Math.min(dh/wh, dw/ww);
		var sl	=	(dw -  ww*scale)/2;
		var top1 = workdata.downloadbtn_top?((workdata.downloadbtn_top*scale) + "px") : (dh-84*2*scale+"px");
		var top2 = workdata.sharebtn_top?((workdata.sharebtn_top*scale) + "px") : ( dh-84*2*scale+"px");
		var left1 =  workdata.downloadbtn_left?((workdata.downloadbtn_left*scale+sl-65*2*scale) + "px") : (dw/4-65*2*scale+sl+"px");




		var left2 =  workdata.sharebtn_left?((workdata.sharebtn_left*scale+sl-65*2*scale) + "px") : (dw/4*3-65*2*scale+sl+"px");
		
		var dl_style= "width:"+130*scale*2+"px;position:fixed;top:"+top1+";left:"+left1+";text-align: center;";
		var sh_style= "width:"+130*scale*2+"px;position:fixed;top:"+top2+";left:"+left2+";text-align: center;";

			isPay = workdata.is_pay

			var setsharediv = document.createElement("div");
			setsharediv.id = "setsharediv";
			setsharediv.style.cssText='position:fixed;left:0;width:100%;height:148px;bottom:0px;text-align: center;z-index: 1000;';
			setsharediv.innerHTML = '<div id="downtips" style="display:none;top:0px;text-align: center;width:236px;height:28px;margin-left: calc(50% - 118px);opacity: 0.6;background: #000000;border-radius: 16px;font-size: 12px;color: #FFFFFF;letter-spacing: 0;line-height: 28px;"></div><div  id="downloadbtn" style="'+dl_style+'"><div style="border: 1px solid #FFFFFF;border-radius: '+22*scale*2+'px;width:'+130*scale*2+'px;height:'+32*scale*2+'px;font-size: '+14*scale*2+'px;color: #000;background:#FFFFFF;letter-spacing: 0;margin:auto;line-height: '+32*scale*2+'px;z-index:99999;">下载高清视频</div></div><div id="setsharebtn" style="'+sh_style+'"><div style="border: 1px solid #FFFFFF;border-radius: '+22*scale*2+'px;width:'+130*scale*2+'px;height:'+32*scale*2+'px;font-size: '+14*scale*2+'px;color: #000;background:#FFFFFF;letter-spacing: 0;margin:auto;line-height: '+32*scale*2+'px;z-index:99999;">分享设置<div></div>';
			var e_touchstart = 'ontouchstart' in window ?'touchstart':'mousedown';
			document.body.appendChild(setsharediv);
			document.getElementById("downloadbtn").addEventListener(e_touchstart,function(){
				if(isPay){
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
			},false);
			document.getElementById("setsharebtn").addEventListener(e_touchstart,function(){
				window.location.href="./postierSetShare.html?openid="+openid+"&wid="+(pid || wid)+ ( debug?"&debug=1":"" );
			},false);
		}

		document.title = workdata.share_title;
		if(type=="setshare"){

			var fc = document.createElement("div");
			fc.innerHTML = '<div  style="display:block;position:fixed;top:0px;left:0;text-align: center;width:100%;height:28px;opacity: 0.6;background: #000000;font-size: 12px;color: #FFFFFF;letter-spacing: 0;line-height: 28px;z-index:99999;">海报已经生成，点击右上角分享</div>';
			document.body.appendChild(fc);

			utils.share({
				url: workdata.share_url,
				title: workdata.share_title,
				image: workdata.share_image?workdata.share_image:workdata.cover,
				content: workdata.share_summary,
				callback:function(){
					window.location.href= "https://mp.weixin.qq.com/s?__biz=MzI3NTg1ODk0MA==&mid=2247483688&idx=1&sn=367bc5d65b788aeeb25220b5b403401c&chksm=eb7f15bbdc089cad4a3daab0197e96c50c650f1c8e6db3cc71b3b8b4c158f2394bdd1b614e77#rd";
				}
			});
		}else{
			utils.share({
				url: workdata.share_url,
				title: workdata.share_title,
				image: workdata.share_image?workdata.share_image:workdata.cover,
				content: workdata.share_summary
			});			
		}
		new WonxAd({
			dom:dom,
			data:workdata
		});
	})
}else{
	//获取模板信息 
	api.postermodel({mid:mid}).then(function(data){
		var workdata = data.data.data.poster;
		if(debug){
			workdata = utils.debugData(workdata);
		}

		console.log("workdata",workdata);


		workdata.type = type;
		workdata.author = openid;



		var dom = document.getElementById("wonxAd_demo");
		var modelbottom = document.createElement("div");

		var dh = document.body.clientHeight;
		var dw = document.body.clientWidth;
		var wh = workdata.height;
		var ww = workdata.width;
		var scale  = Math.min(dh/wh, dw/ww);
		var sl	=	(dw -  ww*scale)/2;
		var top = workdata.makebtn_top?((workdata.makebtn_top*scale) + "px") : "88%";




		var left =  workdata.makebtn_left?((workdata.makebtn_left*scale+sl-65*2*scale) + "px") : "50%";

		modelbottom.id = "modelbottom";
		modelbottom.style.cssText='position:fixed;font-size:'+14*scale*2+'px;border:none;line-height: '+32*scale*2+'px;height:'+32*scale*2+'px;background-image: linear-gradient(-180deg, #FFFFFF 0%, #EDEDED 100%);border-radius: '+32*scale*2+'px;z-index:99999;top:'+top+';left: '+left+';width: '+130*scale*2+'px;text-align: center;';
		modelbottom.innerHTML = '生成海报';
		document.body.appendChild(modelbottom);
		var editorTips = document.createElement("div");
		editorTips.id = "editorTips";
		editorTips.innerHTML = '';
		document.body.appendChild(editorTips);
		document.title = workdata.share_title;
		utils.share({
				url: workdata.share_url,
				title: workdata.share_title,
				image: workdata.share_image?workdata.share_image:workdata.cover,
				content: workdata.share_summary
			});
		
		new WonxAd({
			dom:dom,
			data:workdata
		});
	})

}


