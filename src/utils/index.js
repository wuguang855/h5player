import setShareInfo from '../lib/share';
var utils = {
	get:function(name){
		return (function() {
			var paramStr = window.location.search.substr(1);
			var paramArr = new  Array({});
			var _paramArr = paramStr.split("&");
			for(var i in _paramArr){
				var n  =  _paramArr[i].split("=")[0];
				if(n){
					paramArr[n]=_paramArr[i].split("=")[1];
				}
			}
			return paramArr;
		})()[name];
	},

	debugData:function(data){
		var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62}|(:[0-9]{1,4}))+\.?/;
		var baseurl = urlReg.exec(data.scenes[0].videoFileName)[0];
		var datastr = JSON.stringify(data);
		var regExp = new RegExp(baseurl, "g");
		datastr = datastr.replace(regExp, window.location.host);
		return JSON.parse(datastr);
	},
	uuid:function () {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },
	share:function(config){
	    var share_url=config.url || window.location.href;
	    var title=config.title || "touchfa";
	    var img_url=config.image;
	    var content=config.content|| "touchfa";
	    var callback = config.callback || null;
		var ua = navigator.userAgent.toLowerCase();
		var iswx = ua.match(/MicroMessenger/i)=="micromessenger";
		if(iswx){
			if(utils.get("debug")&&window.location.host.indexOf("touchfa")<0){
				var wHost = window.location.host;
			}else{
				
			}
			var wHost = "api.touchfa.com";
			var url = "http://"+ wHost +"/home/jssdk?shareurl="+encodeURIComponent(window.location.href);
			var xmlhttp;
			if (window.XMLHttpRequest){
				xmlhttp=new XMLHttpRequest();
			}else{
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.onreadystatechange= function(){
				if (xmlhttp.readyState==4 && xmlhttp.status==200){
					var  res = JSON.parse(xmlhttp.responseText);
					if(res.status == "0") {
					setShareInfo({
						title:         title,
						summary:       content,
						pic:           img_url,
						url:           share_url,
						WXconfig:       {
							swapTitleInWX: false,
							appId: res.data.appId,
							timestamp:res.data.timestamp,
							nonceStr: res.data.nonceStr,
							signature: res.data.signature
						},
						callback:callback
					});
				}
				}
			};
			xmlhttp.open('get',url,true);
			xmlhttp.send(null);
		}else{
			setShareInfo({
				title:          title,
				summary:       content,
				pic:           img_url,
				url:           share_url
			});
			console.log('setSareInfo complete..');
		}
	}



};
export default  utils;